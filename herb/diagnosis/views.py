from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages

from .models import DiagnosisResult
from .services import (
    DIAGNOSIS_QUESTIONS,
    STAGE_INFO,
    GUIDE_TEXT,
    validate_answers,
    count_answers,
    calculate_stage,
)


@login_required
def diagnosis_form(request):
    # GET  /diagnosis/ : 자가진단 질문과 선택지 표시
    # POST /diagnosis/ : 답변 저장, 점수 계산, 단계 판정
    
    if request.method == "POST":
        answers = {
            "q1": request.POST.get("q1"),
            "q2": request.POST.get("q2"),
            "q3": request.POST.get("q3"),
            "q4": request.POST.get("q4"),
            "q5": request.POST.get("q5"),
        }

        if not validate_answers(answers):
            messages.error(request, "모든 문항에 답변해 주세요.")
            return render(
                request,
                "diagnosis/form.html",
                {
                    "questions": DIAGNOSIS_QUESTIONS,
                    "selected_answers": answers,
                },
            )

        counts = count_answers(answers)
        stage = calculate_stage(counts)

        result = DiagnosisResult.objects.create(
            user=request.user,
            q1_answer=answers["q1"],
            q2_answer=answers["q2"],
            q3_answer=answers["q3"],
            q4_answer=answers["q4"],
            q5_answer=answers["q5"],
            a_count=counts["A"],
            b_count=counts["B"],
            c_count=counts["C"],
            stage=stage,
        )

        request.session["latest_diagnosis_result_id"] = result.id

        return redirect("diagnosis:loading")

    return render(
        request,
        "diagnosis/form.html",
        {
            "questions": DIAGNOSIS_QUESTIONS,
        },
    )


@login_required
def diagnosis_loading(request):
    # POST 직후 보여주는 중간 화면.
    # loading.html 안에서 일정 시간 후 result로 자동 이동 처리 필요!
    # (예: <meta http-equiv="refresh" content="2;url=/diagnosis/result/">)
    return render(request, "diagnosis/loading.html")


@login_required
def diagnosis_result(request):
    # GET /diagnosis/result/ : 최신 진단 결과와 단계 설명 표시
    result_id = request.session.get("latest_diagnosis_result_id")

    result = None
    if result_id:
        result = DiagnosisResult.objects.filter(
            id=result_id,
            user=request.user,
        ).first()

    if result is None:
        result = (
            DiagnosisResult.objects
            .filter(user=request.user)
            .order_by("-created_at")
            .first()
        )

    if result is None:
        # 진단 이력이 아예 없으면 설문으로
        return redirect("diagnosis:form")

    return render(
        request,
        "diagnosis/result.html",
        {
            "result": result,
            "stage_data": STAGE_INFO[result.stage],
            "all_stages": STAGE_INFO,
            "guide_text": GUIDE_TEXT,
        },
    )


@login_required
def diagnosis_retry(request):
    # GET/POST /diagnosis/retry/ : 새 자가진단 시작 → /diagnosis/ 로 이동

    request.session.pop("latest_diagnosis_result_id", None)
    return redirect("diagnosis:form")