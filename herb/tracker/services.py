from datetime import date, timedelta
from .models import DailyRecord


# 나의 정원(화분 상세, 허브 심기): 특정 날짜의 증상 기록 조회할 때 사용
def get_daily_record(user, date):

    # 해당 날짜의 기록 조회 (없으면 None)
    found_daily_record = DailyRecord.objects.filter(
        user=user,
        date=date
    ).first()

    # 기록이 아예 없는 경우
    if not found_daily_record:
        return None

    # 증상 없음으로 기록된 경우
    if found_daily_record.no_symptom:
        return {"no_symptom": True, "entries": []}

    # 증상 기록이 있는 경우: 그날 기록된 증상 + 강도 목록 정리
    entries = []
    for entry in found_daily_record.entries.all():
        entries.append(
            {"symptom": entry.symptom.name, "intensity": entry.intensity}
        )

    return {"no_symptom": False, "entries": entries}


# 홈: 이번 주 요일별 기록 여부를 점으로 표시할 때 사용
def get_week_records(user):

    # 오늘 날짜 기준으로 이번 주 월요일 계산
    # date.today().weekday(): 월=0, 화=1, ..., 일=6
    monday = date.today() - timedelta(days=date.today().weekday())

    # 이번 주 기록 여부를 리스트화 (True면 기록)
    week_records = []

    # 월요일부터 하루씩 늘려가며 7일인지 확인
    for i in range(7):
        day = monday + timedelta(days=i)
        exists = DailyRecord.objects.filter(
            user=user,
            date=day
        ).exists()

        week_records.append(exists)

    return week_records


# 패턴 리포트: 주간 그래프 점수, 월간 캘린더 증상 3단계 분류에 사용
def get_daily_score(user, date):

    found_daily_record = DailyRecord.objects.filter(
        user=user,
        date=date
    ).first()

    # 기록 없거나, 증상 없음으로 기록: 0점
    if not found_daily_record or found_daily_record.no_symptom:
        return {"score": 0, "level": "없음"}

    # 강도별 점수표
    intensity_score = {"약": 1, "중": 2, "강": 3}

    # 그날 기록된 모든 증상 점수 합산
    score = 0
    for entry in found_daily_record.entries.all():
        score += intensity_score.get(entry.intensity, 0)

    # 합산 점수에 따라 3단계로 분류 (0점=없음, 1~5점=있음, 6점 이상=심함)
    if score == 0:
        level = "없음"
    elif score <= 5:
        level = "있음"
    else:
        level = "심함"

    return {"score": score, "level": level}