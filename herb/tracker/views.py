from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import Symptom, DailyRecord, SymptomEntry
from datetime import date


# 증상 선택
@login_required
def select_view(request):

    # GET: 사용자가 처음 이 화면 들어왔을 때
    if request.method == "GET":
        symptoms = Symptom.objects.all()
        selected_symptom_ids = request.session.get("selected_symptom_ids", [])
        return render(request, "tracker/select.html", {
            "symptoms": symptoms,
            "selected_symptom_ids": selected_symptom_ids
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

        # 증상 선택 시, db가 아닌 세션에 임시 저장 (아직 강도 선택 전이라서)
        request.session["selected_symptom_ids"] = symptom_ids
        return redirect("tracker:intensity")


# 강도 선택
@login_required
def intensity_view(request):

    symptom_ids = request.session.get("selected_symptom_ids")

    # GET: 세션에서 선택된 증상 id들 가져와서 화면에 표시
    if request.method == "GET":
        symptoms = Symptom.objects.filter(id__in=symptom_ids)
        return render(request, "tracker/intensity.html", {
            "symptoms": symptoms
        })

    # POST: 강도 선택 후 "기록 완료" 버튼 눌렀을 때
    if request.method == "POST":

        # 새로 만든 기록: 하루 증상 기록 생성
        new_daily_record = DailyRecord.objects.create(
            user=request.user,
            date=date.today(),
        )

        # 선택된 증상마다 강도와 함께 db에 저장 (세션 아님)
        for symptom_id in symptom_ids:
            intensity = request.POST.get(f"intensity_{symptom_id}")

            SymptomEntry.objects.create(
                record=new_daily_record,
                symptom_id=symptom_id,
                intensity=intensity
            )

        return redirect("tracker:complete")



# 저장 완료
@login_required
def complete_view(request):

    # 찾아낸 기록: 강도 선택에서 저장한 하루 증상 기록 조회
    found_daily_record = DailyRecord.objects.filter(
        user=request.user,
        date=date.today()
    ).first()

    return render(request, "tracker/complete.html", {
        "daily_record": found_daily_record,
        "date": date.today(),
    })


@login_required
def edit_view(request):
    return HttpResponse("3.4 기록 수정")