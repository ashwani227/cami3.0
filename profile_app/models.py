from django.db import models
from django_mysql.models import ListCharField
from django.core.validators import int_list_validator
from django.contrib.auth.models import UserManager
from django.utils import timezone


class Profile(models.Model):
    firstname = models.CharField(default="",max_length = 150)
    lastname = models.CharField(default="",max_length = 150)
    email = models.CharField(max_length = 150, primary_key=True)
    savedResources =ListCharField(default = "",base_field=models.CharField(max_length=500),size=100,max_length=(500 * 101))
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
