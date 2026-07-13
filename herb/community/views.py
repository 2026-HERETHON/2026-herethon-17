from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404

from .models import Post, Comment


SYMPTOM_FILTERS = [
    ("hot_flash", "안면홍조"),
    ("sleep_disorder", "수면장애"),
    ("mood_swing", "감정기복"),
    ("fatigue", "피로감"),
    ("joint_pain", "관절통"),
]


@login_required
def post_list(request):
    category = request.GET.get("category")

    posts = Post.objects.all()

    if category:
        posts = posts.filter(symptom_tag=category)

    context = {
        "posts": posts,
        "category": category,
        "symptom_filters": SYMPTOM_FILTERS,
    }

    return render(request, "community/list.html", context)


@login_required
def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    context = {
        "post": post,
        "comments": post.comments.all(),
        "is_author": post.author == request.user,
    }

    return render(request, "community/detail.html", context)


@login_required
def post_create(request):
    if request.method == "POST":
        title = request.POST.get("title")
        content = request.POST.get("content")
        symptom_tag = request.POST.get("symptom_tag")

        if not title or not content or not symptom_tag:
            return render(request, "community/form.html", {
                "error": "제목, 내용, 증상 태그를 모두 입력해 주세요.",
                "symptom_filters": SYMPTOM_FILTERS,
            })

        Post.objects.create(
            author=request.user,
            title=title,
            content=content,
            symptom_tag=symptom_tag,
        )

        messages.success(request, "게시글이 등록되었어요.")
        return redirect("community:list")

    return render(request, "community/form.html", {
        "symptom_filters": SYMPTOM_FILTERS,
    })


@login_required
def post_edit(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if post.author != request.user:
        messages.error(request, "본인이 작성한 게시글만 수정할 수 있어요.")
        return redirect("community:detail", post_id=post.id)

    if request.method == "POST":
        title = request.POST.get("title")
        content = request.POST.get("content")
        symptom_tag = request.POST.get("symptom_tag")

        if not title or not content or not symptom_tag:
            return render(request, "community/form.html", {
                "post": post,
                "error": "제목, 내용, 증상 태그를 모두 입력해 주세요.",
                "symptom_filters": SYMPTOM_FILTERS,
            })

        post.title = title
        post.content = content
        post.symptom_tag = symptom_tag
        post.save()

        messages.success(request, "게시글이 수정되었어요.")
        return redirect("community:detail", post_id=post.id)

    return render(request, "community/form.html", {
        "post": post,
        "symptom_filters": SYMPTOM_FILTERS,
    })


@login_required
def post_delete(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if post.author != request.user:
        messages.error(request, "본인이 작성한 게시글만 삭제할 수 있어요.")
        return redirect("community:detail", post_id=post.id)

    if request.method == "POST":
        post.delete()
        messages.success(request, "게시글이 삭제되었어요.")
        return redirect("community:list")

    return redirect("community:detail", post_id=post.id)


@login_required
def comment_create(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if request.method == "POST":
        content = request.POST.get("content")

        if not content:
            messages.error(request, "댓글 내용을 입력해 주세요.")
            return redirect("community:detail", post_id=post.id)

        Comment.objects.create(
            post=post,
            author=request.user,
            content=content,
        )

        messages.success(request, "댓글이 등록되었어요.")
        return redirect("community:detail", post_id=post.id)

    return redirect("community:detail", post_id=post.id)


@login_required
def comment_edit(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)

    if comment.author != request.user:
        messages.error(request, "본인이 작성한 댓글만 수정할 수 있어요.")
        return redirect("community:detail", post_id=comment.post.id)

    if request.method == "POST":
        content = request.POST.get("content")

        if not content:
            messages.error(request, "댓글 내용을 입력해 주세요.")
            return redirect("community:detail", post_id=comment.post.id)

        comment.content = content
        comment.save()

        messages.success(request, "댓글이 수정되었어요.")
        return redirect("community:detail", post_id=comment.post.id)

    return render(request, "community/comment_form.html", {
        "comment": comment,
    })


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

    return redirect("community:detail", post_id=post_id)


@login_required
def my_posts(request):
    posts = Post.objects.filter(author=request.user)

    return render(request, "community/my_posts.html", {
        "posts": posts,
    })