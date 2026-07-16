from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Symptom, DailyRecord, SymptomEntry
from datetime import date
from urllib.parse import urlencode


# 증상 선택
@login_required
def select_view(request):

    symptoms = Symptom.objects.all()

    # 이전 버튼으로 돌아왔을 때, 이전 선택을 다시 체크 표시하기 위함
    selected_symptom_ids = request.GET.getlist("symptom_ids")
    return render(request, "tracker/select.html", {
        "symptoms": symptoms,
        "selected_symptom_ids": selected_symptom_ids
    })


# 강도 선택
@login_required
def intensity_view(request):

    # GET: URL 파라미터에서 선택된 증상 id들 가져와서 화면에 표시
    if request.method == "GET":

        symptom_ids = request.GET.getlist("symptom_ids")
        no_symptom = request.GET.get("no_symptom")

        # 증상 없음 + 다른 증상 동시 선택 방지
        if no_symptom and symptom_ids:
            return redirect("tracker:select")

        # 최소 1개 이상 선택 검증
        if not no_symptom and not symptom_ids:
            return redirect("tracker:select")

        # 증상 없음 선택: db에 바로 저장 후, 저장 완료 화면(3.3)으로 이동
        if no_symptom:
            # db에 바로 저장
            DailyRecord.objects.create(
                user=request.user,
                date=date.today(),
                no_symptom=True
            )
            return redirect("tracker:complete")

        symptoms = Symptom.objects.filter(id__in=symptom_ids)

        # 증상별 아이콘 파일명 매칭
        symptom_icon_map = {
            "안면홍조": "hot",
            "수면장애": "sleep",
            "감정기복": "mood",
            "피로감": "fatigue",
            "관절통": "joint",
        }
        for symptom in symptoms:
            symptom.icon_key = symptom_icon_map.get(symptom.name, "hot")

        # "이전" 버튼을 눌렀을 때, 지금 선택된 증상들을 다시 select 화면에 전달하기 위한 URL
        prev_query = urlencode([("symptom_ids", sid) for sid in symptom_ids])
        prev_url = f"/tracker/select/?{prev_query}"

        return render(request, "tracker/intensity.html", {
            "symptoms": symptoms,
            "prev_url": prev_url,
        })

    # POST: 강도 선택 후 "기록 완료" 버튼 눌렀을 때
    if request.method == "POST":

        # 새로 만든 기록: 하루 증상 기록 생성
        new_daily_record = DailyRecord.objects.create(
            user=request.user,
            date=date.today(),
        )

        # POST로 제출된 증상 id들 가져오기
        symptom_ids = request.POST.getlist("symptom_ids")

        # 선택된 증상마다 강도와 함께 db에 저장
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

    # 아이콘 매칭
    symptom_icon_map = {
        "안면홍조": "hot",
        "수면장애": "sleep",
        "감정기복": "mood",
        "피로감": "fatigue",
        "관절통": "joint",
    }

    entries_with_icon = []

    # 기록 있고, 증상없음이 아닐 때만 아이콘 매칭
    if found_daily_record and not found_daily_record.no_symptom:
        entries_with_icon = list(found_daily_record.entries.all())
        for entry in entries_with_icon:
            entry.symptom.icon_key = symptom_icon_map.get(entry.symptom.name, "hot")

    return render(request, "tracker/complete.html", {
        "daily_record": found_daily_record,
        "entries_with_icon": entries_with_icon,
        "date": date.today(),
    })


# 기록 수정
@login_required
def edit_view(request):

    # 오늘 기록 찾기
    today_record = DailyRecord.objects.filter(
        user=request.user,
        date=date.today()
    ).first()

    # GET: 오늘 기록 불러와서 화면에 표시
    if request.method == "GET":
        symptoms = Symptom.objects.all()

        # 오늘 기록에 저장된 모든 증상 기록(SymptomEntry)을 "증상 id: 강도" 형태의 딕셔너리 생성
        intensity_map = {}
        for entry in today_record.entries.all():
            intensity_map[entry.symptom_id] = entry.intensity

        # db에서 가져온 증상이, 오늘 기록에서 어떤 강도였는지 표시
        # 강도 값이 있으면 그 강도로, 없으면 None 표시
        for symptom in symptoms:
            symptom.saved_intensity = intensity_map.get(symptom.id)

        return render(request, "tracker/edit.html", {
            "symptoms": symptoms,
            "no_symptom": today_record.no_symptom,
        })


    # POST: 수정 완료 버튼 눌렀을 때, 기존 기록을 덮어쓰기
    if request.method == "POST":

        symptom_ids = request.POST.getlist("symptom_ids")
        no_symptom = request.POST.get("no_symptom")

        # 증상 없음 + 다른 증상 동시 선택 방지
        if no_symptom and symptom_ids:
            symptoms = Symptom.objects.all()

            intensity_map = {}
            for entry in today_record.entries.all():
                intensity_map[entry.symptom_id] = entry.intensity

            for symptom in symptoms:
                symptom.saved_intensity = intensity_map.get(symptom.id)

            return render(request, "tracker/edit.html", {
                "symptoms": symptoms,
                "no_symptom": today_record.no_symptom,
                # 아래는 임시 검증용 에러 메시지 (프론트 연동 후 삭제 예정)
                "error": "증상없음과 다른 증상을 동시에 선택할 수 없습니다.",
            })

        # 기존 증상 기록들 삭제 (덮어쓰기 위해)
        today_record.entries.all().delete()

        # 증상 없음으로 수정한 경우
        if no_symptom:
            today_record.no_symptom = True

        # 실제 증상들로 수정한 경우
        else:
            today_record.no_symptom = False

            # 새로운 증상 기록을 만들어 db에 저장
            for symptom_id in symptom_ids:
                intensity = request.POST.get(f"intensity_{symptom_id}")

                SymptomEntry.objects.create(
                    record=today_record,
                    symptom_id=symptom_id,
                    intensity=intensity
                )

        # db에 저장
        today_record.save()

        # 저장 후 다시 오늘 기록 조회 -> 수정 화면에 필요한 데이터 재구성
        symptoms = Symptom.objects.all()

        intensity_map = {}
        for entry in today_record.entries.all():
            intensity_map[entry.symptom_id] = entry.intensity

        for symptom in symptoms:
            symptom.saved_intensity = intensity_map.get(symptom.id)

        return render(request, "tracker/edit.html", {
            "symptoms": symptoms,
            "no_symptom": today_record.no_symptom,
            "just_saved": True,
        })