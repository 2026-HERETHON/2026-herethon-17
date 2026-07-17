from django.conf import settings
from django.db import models

SYMPTOM_CHOICES = [
    ("hot_flash", "안면홍조"),
    ("sleep_disorder", "수면장애"),
    ("mood_swing", "감정기복"),
    ("fatigue", "피로감"),
    ("joint_pain", "관절통"),
]


class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_posts",
        verbose_name="작성자",
    )
    title = models.CharField(max_length=100, verbose_name="제목")
    content = models.TextField(verbose_name="내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    class Meta:
        db_table = "community_post"
        ordering = ["-created_at"]
        verbose_name = "게시글"
        verbose_name_plural = "게시글"

    def __str__(self):
        return self.title


class PostTag(models.Model):
    """복수 태그: 글 하나에 태그 여러 개"""
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE,
        related_name="tags", verbose_name="게시글",
    )
    symptom = models.CharField(
        max_length=30, choices=SYMPTOM_CHOICES, verbose_name="증상",
    )

    class Meta:
        db_table = "community_post_tag"
        unique_together = ["post", "symptom"]  # 같은 글에 같은 태그 중복 방지

    def __str__(self):
        return f"{self.post_id} - {self.get_symptom_display()}"


class PostLike(models.Model):
    """좋아요: 유저당 글마다 1개"""
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE,
        related_name="likes", verbose_name="게시글",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="community_likes", verbose_name="사용자",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "community_post_like"
        unique_together = ["post", "user"]  # 중복 좋아요 방지

    def __str__(self):
        return f"{self.user} ♥ {self.post_id}"


class Comment(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE,
        related_name="comments", verbose_name="게시글",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="community_comments", verbose_name="작성자",
    )
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    class Meta:
        db_table = "community_comment"
        ordering = ["created_at"]
        verbose_name = "댓글"
        verbose_name_plural = "댓글"

    def __str__(self):
        return self.content[:20]