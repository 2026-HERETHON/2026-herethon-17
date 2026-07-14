from django.conf import settings
from django.db import models


class DiagnosisResult(models.Model):
    STAGE_CONFUSION = "confusion"
    STAGE_ADAPTATION = "adaptation"
    STAGE_RESTART = "restart"
    STAGE_CHOICES = [
        (STAGE_CONFUSION, "혼란기"),
        (STAGE_ADAPTATION, "적응기"),
        (STAGE_RESTART, "재도약기"),
    ]
    ANSWER_CHOICES = [
        ("A", "혼란기 경향"),
        ("B", "적응기 경향"),
        ("C", "재도약기 경향"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="diagnosis_results",
    )
    q1_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    q2_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    q3_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    q4_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    q5_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    a_count = models.PositiveSmallIntegerField(default=0)
    b_count = models.PositiveSmallIntegerField(default=0)
    c_count = models.PositiveSmallIntegerField(default=0)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:                                    # ← 기존 Meta를 이걸로 교체
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]
        verbose_name = "자가진단 결과"
        verbose_name_plural = "자가진단 결과 목록"

    def __str__(self):
        return f"{self.user} - {self.get_stage_display()} ({self.created_at:%Y-%m-%d})"