from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.utils import timezone
from django.urls import reverse

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
        .filter(
            user=request.user,
            date=today,
        )
        .first()
    )

    has_today_record = today_record is not None

    # 4. 오늘 기록 여부에 따른 tracker 이동 경로
    tracker_url = (
        reverse("tracker:edit")
        if has_today_record
        else reverse("tracker:select")
    )

    # 5. 이번 주 기록 여부
    week_record_values = get_week_records(request.user)
    week_labels = ["월", "화", "수", "목", "금", "토", "일"]

    # Python weekday: 월요일 0 ~ 일요일 6
    today_weekday_index = today.weekday()

    week_records = [
        {
            "label": week_labels[index],
            "recorded": recorded,
            "is_today": index == today_weekday_index,
        }
        for index, recorded in enumerate(week_record_values)
    ]

    # 6. 이전 로그인 기준 재방문 일수
    # accounts 로그인 View에서 login() 호출 전에
    # previous_login_at을 세션에 저장해야 정상 동작함
    days_since_last_visit = None
    previous_login_at = request.session.get("previous_login_at")

    if previous_login_at:
        try:
            previous_login_datetime = datetime.fromisoformat(
                previous_login_at
            )

            if timezone.is_naive(previous_login_datetime):
                previous_login_datetime = timezone.make_aware(
                    previous_login_datetime
                )

            previous_login_date = timezone.localtime(
                previous_login_datetime
            ).date()

            days_since_last_visit = (
                today - previous_login_date
            ).days

        except (TypeError, ValueError):
            request.session.pop("previous_login_at", None)

    show_welcome_banner = (
        days_since_last_visit is not None
        and days_since_last_visit >= 7
    )

    # 7. Template 데이터
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

        # 재방문 배너
        "days_since_last_visit": days_since_last_visit,
        "show_welcome_banner": show_welcome_banner,

        # 연결 URL
        "reports_url": "/reports/weekly/",
        "garden_url": "/garden/",
        "community_url": "/community/",
        "mypage_url": "/accounts/mypage/",
    }

    return render(
        request,
        "home/index.html",
        context,
    )