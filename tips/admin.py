from django.contrib import admin
from .models import Tip,tipSubscriber 

# Register your models here.
admin.site.register(Tip)
admin.site.register(tipSubscriber)
