from .serializers import *
from .models import Profile
from rest_framework import permissions, viewsets
from rest_framework.decorators import permission_classes, api_view
from rest_framework import viewsets
from django.http import JsonResponse, HttpResponse
from authentication.models import CustomUser
from django.core import serializers



class UserView(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,) 
    serializer_class = UserProfileSerializer
    queryset = Profile.objects.all()
    lookup_field = 'user_id'


@api_view(('POST', 'GET'))
@permission_classes((permissions.IsAuthenticated, ))
def editProfile(request):
    return JsonResponse({'message': 'Success'})


@api_view(('GET',))
@permission_classes((permissions.AllowAny, ))
def changePassword(request):

    email = request.GET['email']
    password = request.GET['password']
    user = CustomUser.objects.get(email=email)
    password = request.GET['password']
    user.set_password(password)
    user.save()
    return JsonResponse({'message':'Success'})


def saveResources(request):
    data = request.GET
    email = data['email']
    resource_url = data['resource']
    obj,created = Profile.objects.get_or_create(email=email)
    obj.savedResources.append(resource_url)
    obj.save()
    return JsonResponse({'message':'Resource Added'})
    

def getProfile(request):
    data = request.GET
    email = data['email']
    profile = Profile.objects.get(email = email)
    profile_obj = {
        'name': profile.firstname + ' ' + profile.lastname,
        'savedResources' : profile.savedResources,
        'dateJoined': profile.date_joined,
        'email': profile.email
    }
    return JsonResponse(profile_obj)
