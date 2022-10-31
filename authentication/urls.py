from django.urls import path
from .views import *
# from rest_framework_simplejwt import views as jwt_views
from rest_framework_jwt.views import obtain_jwt_token



urlpatterns = [
    path('currentuser/', CurrentUserView.as_view(), name='auth-current-user'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('register/', RegisterUsersView.as_view(),name='auth-register'),
    path('retrieve/', RetriveUserView.as_view(), name='auth-retrieve'),
    path('activate/<uidb64>/<token>/', activate, name='activate'),
    path('<pk>/update/', CurrentUserView.as_view(), name='auth-update'),
    path('jwt-token/', obtain_jwt_token, name='create-token'),


]
