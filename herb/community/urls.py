from django.urls import path
from . import views

app_name = "community"

urlpatterns = [
    path("", views.post_list, name="list"),
    path("create/", views.post_create, name="create"),
    path("my-posts/", views.my_posts, name="my_posts"),

    path("<int:post_id>/", views.post_detail, name="detail"),
    path("<int:post_id>/edit/", views.post_edit, name="edit"),
    path("<int:post_id>/delete/", views.post_delete, name="delete"),
    path("<int:post_id>/comments/", views.comment_create, name="comment_create"),

    path("comments/<int:comment_id>/edit/", views.comment_edit, name="comment_edit"),
    path("comments/<int:comment_id>/delete/", views.comment_delete, name="comment_delete"),
]