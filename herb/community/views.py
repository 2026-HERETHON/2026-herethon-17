from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404

from .models import Post, PostTag, PostLike, Comment, SYMPTOM_CHOICES

SYMPTOM_FILTERS = SYMPTOM_CHOICES  # 모델과 단일 소스 공유


@login_required
def post_list(request):
    categories = request.GET.getlist("category")

    posts = Post.objects.all().prefetch_related("tags", "comments", "likes").order_by("-created_at")

    if categories:
        posts = posts.filter(tags__symptom__in=categories).distinct()

    return render(request, "community/community_list.html", {
        "posts": posts,
        "selected_categories": categories,
        "symptom_filters": SYMPTOM_FILTERS,
    })


@login_required
def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    # 작성자의 최신 여정 단계 (diagnosis 연동)
    latest_diag = post.author.diagnosis_results.first()
    author_stage = latest_diag.get_stage_display() if latest_diag else ""

    return render(request, "community/community_detail.html", {
        "post": post,
        "comments": post.comments.all(),
        "is_author": post.author == request.user,
        "author_stage": author_stage,
        "is_liked": post.likes.filter(user=request.user).exists(),
    })


@login_required
def post_like_toggle(request, post_id):
    """좋아요 토글: 있으면 취소, 없으면 추가"""
    post = get_object_or_404(Post, id=post_id)

    if request.method == "POST":
        like = post.likes.filter(user=request.user).first()
        if like:
            like.delete()
        else:
            PostLike.objects.create(post=post, user=request.user)

    return redirect("community:detail", post_id=post.id)


def _save_tags(post, symptom_list):
    """태그 목록을 통째로 교체 (create/edit 공용)"""
    post.tags.all().delete()
    valid_values = {value for value, _ in SYMPTOM_CHOICES}
    for symptom in symptom_list:
        if symptom in valid_values:
            PostTag.objects.create(post=post, symptom=symptom)


@login_required
def post_create(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()
        symptom_tags = request.POST.getlist("symptom_tags")

        if not title or not content or not symptom_tags:
            return render(request, "community/community_write.html", {
                "error": "제목, 내용, 증상 태그를 모두 입력해 주세요.",
                "symptom_filters": SYMPTOM_FILTERS,
                "title": title,
                "content": content,
                "selected_tags": symptom_tags,
            })

        post = Post.objects.create(author=request.user, title=title, content=content)
        _save_tags(post, symptom_tags)

        messages.success(request, "게시가 정상적으로 완료되었어요.")
        return redirect("community:list")

    return render(request, "community/community_write.html", {
        "symptom_filters": SYMPTOM_FILTERS,
        "selected_tags": [],
    })


@login_required
def post_edit(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if post.author != request.user:
        messages.error(request, "본인이 작성한 게시글만 수정할 수 있어요.")
        return redirect("community:detail", post_id=post.id)

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        content = request.POST.get("content", "").strip()
        symptom_tags = request.POST.getlist("symptom_tags")

        if not title or not content or not symptom_tags:
            return render(request, "community/community_write.html", {
                "post": post,
                "error": "제목, 내용, 증상 태그를 모두 입력해 주세요.",
                "symptom_filters": SYMPTOM_FILTERS,
                "title": title,
                "content": content,
                "selected_tags": symptom_tags,
            })

        post.title = title
        post.content = content
        post.save()
        _save_tags(post, symptom_tags)

        messages.success(request, "게시글이 수정되었어요.")
        return redirect("community:detail", post_id=post.id)

    return render(request, "community/community_write.html", {
        "post": post,
        "title": post.title,
        "content": post.content,
        "symptom_filters": SYMPTOM_FILTERS,
        "selected_tags": [t.symptom for t in post.tags.all()],
    })


@login_required
def post_delete(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if post.author != request.user:
        messages.error(request, "본인이 작성한 게시글만 삭제할 수 있어요.")
        return redirect("community:detail", post_id=post.id)

    if request.method == "POST":
        post.delete()
        messages.success(request, "삭제가 정상적으로 완료되었어요.")
        return redirect("community:list")

    return redirect("community:detail", post_id=post.id)


@login_required
def comment_create(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if request.method == "POST":
        content = request.POST.get("content", "").strip()
        if not content:
            messages.error(request, "댓글 내용을 입력해 주세요.")
        else:
            Comment.objects.create(post=post, author=request.user, content=content)
            messages.success(request, "댓글이 등록되었어요.")

    return redirect("community:detail", post_id=post.id)


@login_required
def comment_edit(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)

    if comment.author != request.user:
        messages.error(request, "본인이 작성한 댓글만 수정할 수 있어요.")
        return redirect("community:detail", post_id=comment.post.id)

    if request.method == "POST":
        content = request.POST.get("content", "").strip()
        if not content:
            messages.error(request, "댓글 내용을 입력해 주세요.")
        else:
            comment.content = content
            comment.save()
            messages.success(request, "댓글이 수정되었어요.")

    return redirect("community:detail", post_id=comment.post.id)


@login_required
def comment_delete(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    post_id = comment.post.id

    if comment.author != request.user:
        messages.error(request, "본인이 작성한 댓글만 삭제할 수 있어요.")
        return redirect("community:detail", post_id=post_id)

    if request.method == "POST":
        comment.delete()
        messages.success(request, "댓글이 삭제되었어요.")

    return redirect("community:detail", post_id=post_id)


@login_required
def my_posts(request):
    posts = Post.objects.filter(author=request.user).prefetch_related("tags", "comments", "likes")
    return render(request, "community/my_posts.html", {"posts": posts})