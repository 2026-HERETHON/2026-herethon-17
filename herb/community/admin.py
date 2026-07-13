from django.contrib import admin

from .models import Post, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "symptom_tag", "created_at", "updated_at")
    list_filter = ("symptom_tag", "created_at")
    search_fields = ("title", "content", "author__email", "author__name")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "author", "created_at", "updated_at")
    search_fields = ("content", "author__email", "author__name", "post__title")
