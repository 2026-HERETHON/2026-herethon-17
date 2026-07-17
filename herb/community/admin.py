from django.contrib import admin

from .models import Post, PostTag, Comment


class PostTagInline(admin.TabularInline):
    model = PostTag
    extra = 0


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "author",
        "display_symptom_tags",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "tags__symptom",
        "created_at",
    )

    search_fields = (
        "title",
        "content",
        "author__email",
        "author__name",
    )

    inlines = [PostTagInline]

    @admin.display(description="증상 태그")
    def display_symptom_tags(self, obj):
        return ", ".join(
            tag.get_symptom_display()
            for tag in obj.tags.all()
        )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "post",
        "author",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "content",
        "author__email",
        "author__name",
        "post__title",
    )