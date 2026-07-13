from django.urls import path
from . import views

app_name = "tracker"

urlpatterns = [
    path("select/", views.select_view, name="select"),
    path("intensity/", views.intensity_view, name="intensity"),
    path("complete/", views.complete_view, name="complete"),
    path("edit/", views.edit_view, name="edit"),
]