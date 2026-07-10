from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import Symptom, DailyRecord
from datetime import date


# 증상 선택
@login_required
def select_view(request):

    # GET: 사용자가 처음 이 화면 들어왔을 때
    if request.method == "GET":
        symptoms = Symptom.objects.all()
        return render(request, "tracker/select.html", {
            "symptoms": symptoms
        })

    # POST: 사용자가 증상 선택 후, "다음" 버튼 눌러서 제출할 때
    if request.method == "POST":

        symptom_ids = request.POST.getlist("symptom_ids")
        no_symptom = request.POST.get("no_symptom")

        # 증상 없음 + 다른 증상 동시 선택 방지
        if no_symptom and symptom_ids:
            symptoms = Symptom.objects.all()
            return render(request, "tracker/select.html", {
                "symptoms": symptoms
            })

        # 증상 없음 선택: db에 바로 저장 후, 저장 완료 화면(3.3)으로 이동
        if no_symptom:

            # db에 바로 저장
            DailyRecord.objects.create(
                user=request.user,
                date=date.today(),
                no_symptom=True
            )

            return redirect("tracker:complete")

        # 증상 선택 시, 세션에 임시 저장 (아직 강도 선택 전이라서)
        request.session["selected_symptom_ids"] = symptom_ids
        return redirect("tracker:intensity")



@login_required
def intensity_view(request):
    return HttpResponse("3.2 강도 선택")


@login_required
def complete_view(request):
    return HttpResponse("3.3 저장 완료")


@login_required
def edit_view(request):
    return HttpResponse("3.4 기록 수정")