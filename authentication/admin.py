from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
  """
  Custom admin class for custom user
  """

  list_display = [
    'id',
    'email',
    'first_name',
    'last_name',
    'is_active',
    'is_staff',
    'is_superuser',
  ]

  # Filters
  list_filter = [
    'is_active',
    'is_staff',
    'is_superuser',
  ]

  # User Info Display
  fieldsets = [
    ('Login Information',
    {
      'fields':[
        'email',
        'password'
      ]
    }),
    ('User Details',
    {
      'fields':[
        'first_name',
        'last_name',
      ]
    }),
    ('Access Level',
    {
      'fields':[
        'is_active',
        'is_staff',
        'is_superuser'
      ]
    })
  ]

  # Search Fields
  search_fields = [
    'id',
    'email',
    'first_name',
    'last_name',
  ]

  ordering = [
    'id',
    'email',
  ]

  filter_horizontal = ()


  add_fieldsets = [
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'is_staff',
                'is_active',
                'is_superuser',
            )}
         ),
    ]

# Registering the custom user model and the custom user admin
admin.site.register(CustomUser, CustomUserAdmin)