"""CAMI URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from authentication import views
from profile_app import views as profile_views
from bug_reporting import views as bug_report
from django.conf.urls.static import static
from django.conf import settings
from django.views.static import serve




admin.site.site_header = 'CAMI admin'
admin.site.site_title = 'CAMI admin'
admin.site.index_title = 'CAMI administration'
admin.empty_value_display = '**Empty**'

urlpatterns = [
    re_path(r'^static/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),
    path('api-auth/', include('rest_framework.urls')),
    path('userInterface/', include('userinterface.urls')),
    path('api/profile_app/',include('profile_app.api_urls', namespace='profile_app')),
    path('admin/', admin.site.urls),
    path('authentication/',include('authentication.urls')),
    path('chat/', include('chat_module.api_urls')),
    path('bug/', include('bug_reporting.api_urls')),
    path('', include('userinterface.urls'))]
