from django.urls import path
from . import views

app_name = "diagnosis"

urlpatterns = [
    path("", views.diagnosis_form, name="form"),  # GET: 설문 표시 / POST: 제출
    path("loading/", views.diagnosis_loading, name="loading"),
    path("result/", views.diagnosis_result, name="result"), # GET: 최신 결과
    path("retry/", views.diagnosis_retry, name="retry"), # GET/POST: 다시하기
]