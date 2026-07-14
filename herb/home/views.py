from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.utils import timezone

from diagnosis.models import DiagnosisResult
from tracker.models import DailyRecord
from tracker.services import get_week_records


@login_required
def home_view(request):
    # 1. 최신 자가진단 결과 조회
    latest_diagnosis = (
        DiagnosisResult.objects
        .filter(user=request.user)
        .order_by("-created_at")
        .first()
    )

    # 자가진단 결과가 없으면 자가진단 화면으로 이동
    if latest_diagnosis is None:
        return redirect("diagnosis:form")

    # 2. 오늘 날짜
    today = timezone.localdate()

    # 3. 오늘 증상 기록 여부 확인
    today_record = (
        DailyRecord.objects
        .filter(user=request.user, date=today)
        .first()
    )

    has_today_record = today_record is not None

    # 4. 오늘 기록 여부에 따라 증상 트래커 이동 URL 분기
    if has_today_record:
        tracker_url = "/tracker/edit/"
    else:
        tracker_url = "/tracker/select/"

    # 5. 이번 주 기록 여부 조회
    # get_week_records(user)는 [True, False, ...] 형태로 반환
    week_record_values = get_week_records(request.user)

    week_labels = ["월", "화", "수", "목", "금", "토", "일"]

    week_records = [
        {
            "label": week_labels[index],
            "recorded": recorded,
        }
        for index, recorded in enumerate(week_record_values)
    ]

    # 6. template에 넘길 데이터
    context = {
        "user": request.user,
        "user_name": request.user.name,
        "today": today,

        # diagnosis
        "latest_diagnosis": latest_diagnosis,
        "current_stage": latest_diagnosis.get_stage_display(),

        # tracker
        "has_today_record": has_today_record,
        "today_record": today_record,
        "tracker_url": tracker_url,
        "week_records": week_records,

        # 연결 URL
        "reports_url": "/reports/weekly/",
        "garden_url": "/garden/",
        "community_url": "/community/",
        "mypage_url": "/accounts/mypage/",
    }

    return render(request, "home/home.html", context)