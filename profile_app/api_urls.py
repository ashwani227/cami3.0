from django.urls import path, include
from profile_app.views import *
from rest_framework.routers import DefaultRouter


app_name = 'profile_app'

router = DefaultRouter()
router.register('profile', UserView, basename='user_profile')



urlpatterns = [
    path('editProfile', editProfile),
    path('changePassword',changePassword),
    path('saveResource',saveResources),
    path('getProfile', getProfile),
    path('', include(router.urls)),
]
