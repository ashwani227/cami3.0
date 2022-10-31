from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone

from .manager import CustomUserManager


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
  Custom User Model for defining custom user fields for signup
  """

    email = models.EmailField(
        verbose_name='Email Address',
        blank=False,
        unique=True,
        max_length=255,
    )

    first_name = models.CharField(
        verbose_name='First Name',
        blank=True,
        max_length=100,
        unique=False,
        null=True,
        default='No name'
    )

    last_name = models.CharField(
        verbose_name='Last Name',
        blank=True,
        max_length=100,
        unique=False,
        null=True,
        default='user'
    )

    gender = models.CharField(
        verbose_name='Gender',
        blank= True,
        max_length= 100,
        unique= False,
        null= True
    )

    affiliation = models.TextField(
        verbose_name='Reason for opening account',
        blank=True,
        max_length=500,
        unique=False,
        null=True,
    )

    profile_picture = models.ImageField(blank=True, null=True, upload_to='profile_pics', default="profile_pic/default.png")

    submissions = models.IntegerField(blank=True, default=0)
    pending_submissions = models.IntegerField(blank=True, default=0)
    approved_submissions = models.IntegerField(blank=True, default=0)

    points = models.IntegerField(blank=True, default=0)

    date_joined = models.DateTimeField(default=timezone.now)

    # Will be turned into True after email verification
    is_active = models.BooleanField(default=True)

    # The newly created user by default is not a reviewer
    is_reviewer = models.BooleanField(default=False)

    # A user; with more rights than regular users
    is_staff = models.BooleanField(default=False)

    # A superuser; with all rights
    is_superuser = models.BooleanField(default=False)

    # notice the absence of a "Password field", that's built in.

    # Email would be used instead of username
    USERNAME_FIELD = 'email'

    # Email & Password are required by default.
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.first_name

