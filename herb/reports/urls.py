from django.urls import path
from . import views

app_name = "reports"

urlpatterns = [
    path("weekly/", views.weekly_view, name="weekly"),
    path("monthly/", views.monthly_view, name="monthly"),
]