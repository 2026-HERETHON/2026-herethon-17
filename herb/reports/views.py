from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse


@login_required
def weekly_view(request):
    return HttpResponse("weekly 화면 준비")


@login_required
def monthly_view(request):
    return HttpResponse("monthly 화면 준비")