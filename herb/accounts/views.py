from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from accounts.models import User
# from diagnosis.models import DiagnosisResponse


# 로그인
def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        # 이메일 존재하는지 확인
        if not User.objects.filter(email=email).exists():
            return render(request, "accounts/login.html", {
                "error": "존재하지 않는 이메일입니다."
            })

        # 비밀번호 유효성 검사
        user = authenticate(request, email=email, password=password)

        if user is None:
            return render(request, "accounts/login.html", {
                "error": "비밀번호가 틀립니다. 비밀번호를 다시 확인해 주세요."
            })

        login(request, user)

        # diagnosis 앱과 연결 예정. 연결 후 주석 제거.
        # if not DiagnosisResponse.objects.filter(user=user).exists():
        #     return redirect("/diagnosis/")
        # else:
        #     return redirect("/home/")

        return redirect("/admin/")   # 임시. 연결 후 제거 예정

    return render(request, "accounts/login.html")


def signup_view(request):
    if request.method == "POST":

        name = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        password_confirm = request.POST.get("password_confirm")
        birth_date = request.POST.get("birth_date") or None
        terms_agreed = request.POST.get("terms_agreed")

        # 이메일 중복 확인
        if User.objects.filter(email=email).exists():
            return render(request, "accounts/signup.html", {
                "error": "이미 가입된 이메일입니다. 다른 이메일을 입력해 주세요."
            })

        # 비밀번호 길이 확인
        if len(password) < 8:
            return render(request, "accounts/signup.html", {
                "error": "비밀번호가 너무 짧습니다. 비밀번호를 8자 이상 입력해 주세요."
            })

        # 비밀번호 확인 일치 여부
        if password != password_confirm:
            return render(request, "accounts/signup.html", {
                "error": "비밀번호가 일치하지 않습니다."
            })

        # 서비스 이용약관 동의 확인
        if not terms_agreed:
            return render(request, "accounts/signup.html", {
                "error": "서비스 이용약관에 동의해 주세요."
            })


        # 회원가입
        User.objects.create_user(
            name=name,
            email=email,
            password=password,
            birth_date=birth_date,
        )

        return redirect("accounts:login")

    return render(request, "accounts/signup.html")