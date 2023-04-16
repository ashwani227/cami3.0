from django.shortcuts import render, redirect
import os, re
from django.http import HttpResponse

# Create your views here.
def index(request, path):
    print("In UI2")
    return render(request, '/home/ashwanisingla/cami/CAMI/userinterface/react/build/index.html')
