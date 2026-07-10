from django.db import models
from django.conf import settings

# 5개 고정 증상: 안면홍조, 수면장애, 감정기복, 피로감, 관절통
class Symptom(models.Model):

    name = models.CharField(
        max_length=10,
        verbose_name="증상명"
    )

    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="정렬 순서"
    )

    class Meta:
        db_table = "tracker_symptom"
        ordering = ["order"]
        verbose_name = "증상"
        verbose_name_plural = "증상"



# 하루 단위 증상
class DailyRecord(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="사용자"
    )

    date = models.DateField(
        verbose_name="기록 날짜"
    )

    no_symptom = models.BooleanField(
        default=False,
        verbose_name="증상 없음"
    )


    class Meta:
        db_table = "tracker_dailyrecord"
        unique_together = ("user", "date")
        verbose_name = "일일 기록"
        verbose_name_plural = "일일 기록"


# 개별 증상 + 강도
class SymptomEntry(models.Model):

    symptom = models.ForeignKey(
        Symptom,
        on_delete=models.CASCADE,
        related_name="entries",
        verbose_name="연결 증상"
    )

    intensity = models.CharField(
        max_length=10,
        verbose_name="강도"
    )

    # 기록한 증상이 어느 날짜(DailyRecord)에 속하는지 연결
    record = models.ForeignKey(
        DailyRecord,
        on_delete=models.CASCADE,
        related_name="entries",
        verbose_name="일일 기록"
    )

    class Meta:
        db_table = "tracker_symptomentry"
        verbose_name = "증상 기록"
        verbose_name_plural = "증상 기록"