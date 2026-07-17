from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from tracker.services import get_daily_record

from .models import GardenRecord


@login_required
def garden_list(request):
    records = GardenRecord.objects.filter(
        user=request.user,
    )

    return render(
        request,
        "garden/garden_list.html",
        {
            "records": records,
        },
    )


@login_required
def garden_detail(request, record_id):
    record = get_object_or_404(
        GardenRecord,
        id=record_id,
        user=request.user,
    )

    symptom_record = get_daily_record(
        request.user,
        record.record_date,
    )

    day_symptoms = []

    if symptom_record:
        for entry in symptom_record.entries.select_related("symptom"):
            day_symptoms.append(
                {
                    "name": entry.symptom.name,
                    "intensity": entry.get_intensity_display(),
                }
            )

    return render(
        request,
        "garden/garden_detail.html",
        {
            "record": record,
            "symptom_record": symptom_record,
            "day_symptoms": day_symptoms,
        },
    )


@login_required
def garden_create(request):
    today = timezone.localdate()

    symptom_record = get_daily_record(
        request.user,
        today,
    )

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        memo = request.POST.get("memo", "").strip()
        image = request.FILES.get("image")

        if not title or not memo:
            return render(
                request,
                "garden/garden_write.html",
                {
                    "error": "제목과 한 줄 소감을 모두 입력해 주세요.",
                    "today": today,
                    "symptom_record": symptom_record,
                    "title": title,
                    "memo": memo,
                },
            )

        GardenRecord.objects.create(
            user=request.user,
            title=title,
            memo=memo,
            image=image,
        )

        messages.success(
            request,
            "허브 심기 완료",
        )

        return redirect("garden:list")

    return render(
        request,
        "garden/garden_write.html",
        {
            "today": today,
            "symptom_record": symptom_record,
            "today_symptoms": build_symptom_context(symptom_record),
        },
    )


@login_required
def garden_delete(request, record_id):
    record = get_object_or_404(
        GardenRecord,
        id=record_id,
        user=request.user,
    )

    if request.method != "POST":
        return redirect(
            "garden:detail",
            record_id=record.id,
        )

    try:
        record.delete()

        messages.success(
            request,
            "삭제가 정상적으로 완료되었어요.",
        )

    except Exception:
        messages.error(
            request,
            "게시글을 삭제하지 못했습니다.\n다시 한번 시도해 주세요.",
        )

    return redirect("garden:list")


@login_required
def garden_edit(request, record_id):
    record = get_object_or_404(
        GardenRecord,
        id=record_id,
        user=request.user,
    )

    symptom_record = get_daily_record(
        request.user,
        record.record_date,
    )

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        memo = request.POST.get("memo", "").strip()
        image = request.FILES.get("image")

        if not title or not memo:
            return render(
                request,
                "garden/garden_write.html",
                {
                    "error": "제목과 한 줄 소감을 모두 입력해 주세요.",
                    "record": record,
                    "title": title,
                    "memo": memo,
                    "symptom_record": symptom_record,
                    "today_symptoms": build_symptom_context(symptom_record),
                    "is_edit": True,
                },
            )

        record.title = title
        record.memo = memo

        if image:
            record.image = image

        record.save()

        messages.success(
            request,
            "화분 기록이 수정되었어요.",
        )

        return redirect(
            "garden:detail",
            record_id=record.id,
        )

    return render(
        request,
        "garden/garden_write.html",
        {
            "record": record,
            "title": record.title,
            "memo": record.memo,
            "symptom_record": symptom_record,
            "today_symptoms": build_symptom_context(symptom_record),
            "is_edit": True,
        },
    )

SYMPTOM_ICON_MAP = {
    "안면홍조": "assets/icons/symptom_hot_active.svg",
    "수면장애": "assets/icons/symptom_sleep_active.svg",
    "감정기복": "assets/icons/symptom_mood_active.svg",
    "피로감": "assets/icons/symptom_fatigue_active.svg",
    "관절통": "assets/icons/symptom_joint_active.svg",
}

INTENSITY_CLASS_MAP = {1: "low", 2: "mid", 3: "high"}


def build_symptom_context(symptom_record):
    if not symptom_record or symptom_record.no_symptom:
        return []

    symptoms = []

    for entry in symptom_record.entries.select_related("symptom").all():
        intensity_label = entry.get_intensity_display()

        symptoms.append({
            "name": entry.symptom.name,
            "level_label": intensity_label,
            "level_class": INTENSITY_CLASS_MAP.get(entry.intensity, ""),
            "icon_path": SYMPTOM_ICON_MAP.get(
                entry.symptom.name,
                "assets/icons/symptom_none_active.svg",
            ),
        })

    return symptoms