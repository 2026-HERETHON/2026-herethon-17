from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# admin 페이지에서 사용자  관리
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "birth_date", "is_staff")
    ordering = ("email",)

    # 기존 사용자 조회 및 수정
    fieldsets = (
        ("계정 정보", {
            "fields": ("name", "email", "password", "birth_date", "profile_image")
        }),
    )

    # admin 페이지에서 새 사용자 생성
    add_fieldsets = (
        ("계정 정보", {
            "fields": ("name", "email", "password1", "password2", "birth_date", "profile_image")
        }),
    )