from django.urls import include, path
from django.contrib import admin
from rest_framework import routers
from .views import report, findAll
from django.conf.urls.static import static
from django.conf import settings
from django.urls import re_path
from django.views.static import serve

urlpatterns = [
    path('report', report),
    path('find',findAll),
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)