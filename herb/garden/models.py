from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class GardenRecord(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="garden_records",
        verbose_name="사용자",
    )

    title = models.CharField(
        max_length=50,
        verbose_name="제목",
    )

    memo = models.CharField(
        max_length=100,
        verbose_name="한 줄 소감",
    )

    image = models.ImageField(
        upload_to="garden/",
        null=True,
        blank=True,
        verbose_name="사진",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="생성일",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="수정일",
    )

    class Meta:
        db_table = "garden_record"
        ordering = ["-created_at"]
        verbose_name = "정원 기록"
        verbose_name_plural = "정원 기록"

    def __str__(self):
        return self.title

    @property
    def is_new_challenge(self):
        return self.created_at >= timezone.now() - timedelta(hours=24)

    @property
    def record_date(self):
        return timezone.localtime(self.created_at).date()