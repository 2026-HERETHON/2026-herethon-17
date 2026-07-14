from django.urls import path
from . import views

app_name = "garden"

urlpatterns = [
    path("", views.garden_list, name="list"),
    path("create/", views.garden_create, name="create"),
    path("<int:record_id>/", views.garden_detail, name="detail"),
    path("<int:record_id>/delete/", views.garden_delete, name="delete"),
]