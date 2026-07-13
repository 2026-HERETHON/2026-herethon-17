from datetime import date, timedelta
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tracker.services import get_daily_score
from tracker.models import DailyRecord, SymptomEntry
from calendar import monthrange


# 주간 리포트: 특정 주의 증상 기록을 주간 그래프와 증상별 현황으로 보여줌
@login_required
def weekly_view(request):

    # 기준 날짜 계산
    date_str = request.GET.get("date")

    # date 파라미터 있으면 그 날짜를 기준으로 (이전 주, 다음 주)
    if date_str:
        year, month, day = date_str.split("-")
        base_date = date(int(year), int(month), int(day))

    else:   # date 파라미터 없으면, 오늘을 기준으로
        base_date = date.today()

    # 이번 주 월요일, 일요일 계산
    monday = base_date - timedelta(days=base_date.weekday())
    sunday = monday + timedelta(days=6)

    # 지난주, 다음 주 날짜 (화살표 버튼 관련)
    prev_week = monday - timedelta(days=7)
    next_week = monday + timedelta(days=7)

    # 주간 요일별 점수 계산
    weekly_scores = []
    for i in range(7):
        day = monday + timedelta(days=i)
        day_score_result = get_daily_score(request.user, day)
        weekly_scores.append(day_score_result["score"])

    # 이 기간에 기록이 하나라도 있는지 확인 (빈 상태 처리)
    has_record = DailyRecord.objects.filter(
        user=request.user,
        date__gte=monday,
        date__lte=sunday
    ).exists()

    # 증상별 현황 집계 (특정 주에 각 증상이 몇 번 기록됐는지)
    symptom_counts = {}

    # 특정 주에 속하는 모든 증상 기록 조회
    entries = SymptomEntry.objects.filter(
        record__user=request.user,
        record__date__gte=monday,
        record__date__lte=sunday
    )

    # 조회 기록 안에서 증상 이름별로 몇 번 등장했는지 횟수 기록
    for entry in entries:
        symptom_name = entry.symptom.name

        # 이미 등장한 적 있는 증상이면, 1씩 횟수 늘리기
        if symptom_name in symptom_counts:
            symptom_counts[symptom_name] += 1

        else:   # 처음 등장하는 증상이면 1로 시작
            symptom_counts[symptom_name] = 1


    return render(request, "reports/weekly.html", {
        "monday": monday,
        "sunday": sunday,
        "prev_week": prev_week,
        "next_week": next_week,
        "weekly_scores": weekly_scores,
        "has_record": has_record,
        "symptom_counts": symptom_counts,
    })


# 월간 리포트: 특정 달의 증상 기록을 캘린더와 이번 달 요약으로 보여줌
@login_required
def monthly_view(request):

    # 기준 연도, 월 계산
    year_str = request.GET.get("year")
    month_str = request.GET.get("month")

    # year, month 있으면 그 값을 기준으로 (이전 달, 다음 달)
    if year_str and month_str:
        year = int(year_str)
        month = int(month_str)

    else:   # 파라미터 없으면 오늘을 기준으로
        year = date.today().year
        month = date.today().month

    # 이번 달의 1일, 마지막 날짜 계산
    first_day = date(year, month, 1)
    last_day_num = monthrange(year, month)[1]

    # 이전 달 연도, 월 계산 (1월이면 작년 12월로 넘어감)
    if month == 1:
        prev_year = year - 1
        prev_month = 12
    else:
        prev_year = year
        prev_month = month - 1

    # 다음 달 연도, 월 계산 (12월이면 내년 1월로 넘어감)
    if month == 12:
        next_year = year + 1
        next_month = 1
    else:
        next_year = year
        next_month = month + 1

    # 날짜별 증상 분류: 없음/있음/심함 계산 (캘린더 색상 표시)
    day_levels = {}
    for i in range(last_day_num):   # 마지막 날까지 반복
        current_day = first_day + timedelta(days=i)
        day_score_result = get_daily_score(request.user, current_day)

        day_levels[current_day.day] = day_score_result["level"]


    # 이번 달 요약 집계 변수: 0으로 초기화
    record_count = 0
    symptom_day_count = 0
    no_symptom_day_count = 0


    # 기록 여부, 증상 유무 집계
    for i in range(last_day_num):
        current_day = first_day + timedelta(days=i)

        # 기록 있는지 확인
        found_record = DailyRecord.objects.filter(
            user=request.user,
            date=current_day
        ).first()

        if found_record:
            record_count += 1   # 기록 있으면, 기록일 수 +1 증가

            if found_record.no_symptom:     # 그 기록이 증상 없음인 경우
                no_symptom_day_count += 1
            else:
                symptom_day_count += 1

    # 이 달에 기록이 하나라도 있는지 확인 (빈 상태 처리)
    has_record = record_count > 0

    return render(request, "reports/monthly.html", {
        "year": year,
        "month": month,
        "prev_year": prev_year,
        "prev_month": prev_month,
        "next_year": next_year,
        "next_month": next_month,
        "day_levels": day_levels,
        "has_record": has_record,
        "record_count": record_count,
        "symptom_day_count": symptom_day_count,
        "no_symptom_day_count": no_symptom_day_count,
    })