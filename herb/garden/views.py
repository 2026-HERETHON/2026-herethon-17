from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone

from tracker.services import get_daily_record
from .models import GardenRecord


@login_required
def garden_list(request):
    records = GardenRecord.objects.filter(user=request.user)

    return render(request, "garden/list.html", {
        "records": records,
    })


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

    return render(request, "garden/detail.html", {
        "record": record,
        "symptom_record": symptom_record,
    })


@login_required
def garden_create(request):
    today = timezone.localdate()

    symptom_record = get_daily_record(
        request.user,
        today,
    )

    if request.method == "POST":
        title = request.POST.get("title")
        memo = request.POST.get("memo")
        image = request.FILES.get("image")

        if not title or not memo:
            return render(request, "garden/form.html", {
                "error": "제목과 한 줄 소감을 모두 입력해 주세요.",
                "today": today,
                "symptom_record": symptom_record,
            })

        GardenRecord.objects.create(
            user=request.user,
            title=title,
            memo=memo,
            image=image,
        )

        messages.success(request, "허브 심기가 완료되었어요.")
        return redirect("garden:list")

    return render(request, "garden/form.html", {
        "today": today,
        "symptom_record": symptom_record,
    })


@login_required
def garden_delete(request, record_id):
    record = get_object_or_404(
        GardenRecord,
        id=record_id,
        user=request.user,
    )

    if request.method == "POST":
        record.delete()
        messages.success(request, "화분이 삭제되었어요.")
        return redirect("garden:list")

    return redirect("garden:detail", record_id=record.id)