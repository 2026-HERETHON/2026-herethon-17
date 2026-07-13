from django.contrib import admin
from .models import GardenRecord


@admin.register(GardenRecord)
class GardenRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "memo", "created_at", "updated_at")
    search_fields = ("title", "memo", "user__email", "user__name")
    list_filter = ("created_at",)