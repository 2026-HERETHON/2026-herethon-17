from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from accounts.models import User
# from diagnosis.models import DiagnosisResponse


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