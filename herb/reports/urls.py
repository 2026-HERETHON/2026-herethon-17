from django.urls import path
from . import views

app_name = "reports"

urlpatterns = [
    path("", views.report_view, name="report"),
    path("weekly/", views.weekly_view, name="weekly"),
    path("monthly/", views.monthly_view, name="monthly"),
]