from django.contrib.auth.forms import UserCreationForm
from django import forms

from .models import CustomUser

class RegistrationForm(UserCreationForm):
  class Meta:
    model = CustomUser
    fields = ('email','first_name','last_name','password1','password2',)