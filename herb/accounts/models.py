from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# username 대신 email을 기준으로 User를 생성하는 매니저
class CustomUserManager(BaseUserManager):

    # 일반 사용자 생성
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("이메일은 필수입니다.")
        email = self.normalize_email(email)     # 이메일 형식 표준화(대문자/소문자 등)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)     # 비밀번호 암호화
        user.save(using=self._db)

        return user

    # 관리자 계정 생성
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)       # Admin 페이지 접근 권한
        extra_fields.setdefault("is_superuser", True)   # 모든 권한

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser는 is_staff=True 여야 합니다.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser는 is_superuser=True 여야 합니다.")

        return self.create_user(email, password, **extra_fields)


# username 대신 이메일으로 로그인하는 사용자 모델
class User(AbstractUser):

    username = None
    email = models.EmailField(
        unique=True,
        error_messages={"unique": "이미 가입된 이메일입니다. 다른 이메일을 입력해 주세요."},
        verbose_name="이메일",
    )

    birth_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="생년월일")

    profile_image = models.ImageField(
        upload_to="profile/",
        null=True,
        blank=True,
        verbose_name="프로필 이미지"
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "accounts_user"
        verbose_name = "사용자"
        verbose_name_plural = "사용자"

    def __str__(self):
        return self.email