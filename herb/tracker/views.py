from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse

@login_required
def select_view(request):
    return HttpResponse("3.1 준비")


@login_required
def intensity_view(request):
    return HttpResponse("3.2 준비")


@login_required
def complete_view(request):
    return HttpResponse("3.3 준비")


@login_required
def edit_view(request):
    return HttpResponse("3.4 준비")