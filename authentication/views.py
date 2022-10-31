import datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.contrib.sessions.models import Session
from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import ValidationError
from django.core.mail import EmailMessage
from django.core.validators import validate_email
from django.db import IntegrityError
from django.http import HttpResponse
from django.shortcuts import redirect
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import filters
from rest_framework import permissions, status, generics
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework_jwt.settings import api_settings

from .api.serializers import (CustomUserSerializer,
                              CustomUserTokenSerializer,
                              UserUpdateSerializer)
from .email_manager.email_tokens import account_activation_token
from .models import CustomUser
from profile_app.models import Profile
from .email_manager.email_tokens import account_activation_token


# Get the JWT settings, add these lines after the import/from lines
jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

class CurrentUserView(generics.RetrieveAPIView):
    """
    GET /authentication/currentuser
    Retrive User API
    """
    permission_classes = (permissions.AllowAny,)  # anyone can have access

    def get(self, request, *args, **kwargs):
        """
        A get method for getting the current user who is already logged in.
        reference: https://stackoverflow.com/questions/8000040/how-to-get-logged-in-users-uid-from-session-in-django
        :param request: Request generated from the frontend form
        :param args: Non keyword arguments
        :param kwargs: Keyword arguments
        :return: Response of serialized data or status
        """
        
        user = request.user
        if user.is_authenticated:
            serializer = CustomUserTokenSerializer(user, context={'request': request})
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)



class LoginView(generics.CreateAPIView):
    """
    POST authentication/login
    Login API
    """
    # This permission class will override the global permission
    # class setting
    permission_classes = (permissions.AllowAny,)  # Anyone can access
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserTokenSerializer

    def post(self, request, *args, **kwargs):
        """
        A post method for letting user login
        :param request: Request generated from the frontend form
        :param args: Non keyword arguments
        :param kwargs: Keyword arguments
        :return: Response of serialized data or status
        """
        email = request.data.get('email', '')
        password = request.data.get('password', '')

        # authenticate the user
        user = authenticate(request, email=email, password=password)

        if user is not None:
            # login saves the user's ID in the session
            login(request, user)
            # print(request.user)
            # ***************Use of context is a big question here!!!*************
            serializer = CustomUserTokenSerializer(user, context={'request': request}).data
            return Response(serializer)

        return Response(data={'message': 'Incorrect Email or Password! Please try again.'},
                        status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


class RegisterUsersView(generics.CreateAPIView):
    """
    POST /authentication/register/
    Registration API
    """
    permission_classes = (permissions.AllowAny,)  # Anyone can register

    def post(self, request, *args, **kwargs):
        """
        This post method creates a valid new user
        :param request: Request generated from the frontend form
        :param args: Non keyword arguments
        :param kwargs: Keyword arguments
        :return: Response of serialized data or status
        """
        email = request.data.get('email', )
        password = request.data.get('password', )
        first_name = request.data.get('first_name', )
        gender = request.data.get('gender', )
        # print("Details captured")
        if not email and not password:
            return Response(
                data={
                    'message': 'Email and Password are required to register a user.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Checking if the email address was in valid format
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                data={
                    'message': 'Not a valid email address.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify if the password is at least 8 characters long
        try:
            validate_password(password)
            # print('password validated')
        except ValidationError:
            return Response(
                data={
                    'message': 'Not a valid email address.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = CustomUser.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                gender = gender,
                is_active=False
            )

            # print("user created")
        except IntegrityError:
            return Response(
                data={
                    'message': 'Email already exists. Please try a new email address.'
                },
                status=status.HTTP_226_IM_USED
            )

        # get the current site
        current_site = get_current_site(request)
        # setting email subject
        mail_subject = 'Activate CAMI Account'
        # setting email body through rendering
        # the json data into string to show on a html template
        message = render_to_string(
            'activation_email.html',
            {
                'user': user,
                'domain': current_site.domain,
                # encoding the bytes of user's primary key
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                # creating a token from the user's details
                'token': account_activation_token.make_token(user),
            }
        )

        # creating an Email message object with designated fields
        email = EmailMessage(
            subject=mail_subject,
            body=message,
            to=[user.email, ]
        )

        email.content_subtype = "html"  # Main content is now text/html instead of plain text
        email.send()

        return Response(
            data={
                'message': 'An activation email has been sent to your email address. Please check your email. Thank you!'},
            status=status.HTTP_201_CREATED
        )

def activate(request, uidb64, token):
    """
    activate view function renders upon clicking the link sent on the email.
    references:
        1. https://medium.com/@frfahim/django-registration-with-confirmation-email-bb5da011e4ef
        2. https://blog.hlab.tech/part-ii-how-to-sign-up-user-and-send-confirmation-email-in-django-2-1-and-python-3-6/
    :param request: The link request sent from the email address
    :param uidb64: The base64 encoded primary key
    :param token: The token created from the User details
    :return: Response with serialized User, status value
    """
    try:
        # Decoding the uidb64 and transforming into text
        uid = force_text(urlsafe_base64_decode(uidb64))

        # Retrieving the user with such user id
        user = CustomUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        # Assign user as None if no user is found with that id
        user = None

    # If the user exists and the token is similar, activate the user
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user_profile = Profile.objects.create(
                email = user.email,
                firstname=user.first_name,
            )

        user.save()
        return redirect('http://127.0.0.1:3000/login/')
        # return HttpResponse('Thank you for your email confirmation. Now you can login your account.')
    else:
        return HttpResponse('Activation link is invalid!')
        # return Response(status=status.HTTP_401_UNAUTHORIZED)


class UpdateUserView(generics.RetrieveUpdateAPIView):
    """
    PUT /authentication/<pk>/update/
    Update User API
    """
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can update their own account
    queryset = CustomUser.objects.all()
    serializer_class = UserUpdateSerializer


class RetriveUserView(generics.RetrieveAPIView):
    """
    GET /authentication/retrieve
    Retrive User API
    """
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can have access
    queryset = CustomUser.objects.all()

    def get(self, request, *args, **kwargs):
        """
        A get method for getting the current user's details.
        :param request: Request generated from the frontend form
        :param args: Non keyword arguments
        :param kwargs: Keyword arguments
        :return: Response of serialized data or status
        """
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)



class LogoutView(generics.RetrieveAPIView):
    """
    GET /authentication/logout
    Logout User API
    """
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can have access

    def get(self, request, *args, **kwargs):
        """
        A get method for letting user logout.
        :param request: Request generated from the frontend form
        :param args: Non keyword arguments
        :param kwargs: Keyword arguments
        :return: Response of serialized data or status
        """
        logout(request)
        # If the user becomes anonymous, return HTTP_200_OK
        if request.user.is_anonymous:
            return Response(data={'user': 'AnonymousUser'}, status=status.HTTP_200_OK)

        # If the user is not anonymous, meaning no logout happened, return HTTP_400_BAD_REQUEST
        return Response(data={'user': 'NotAnonymousUser'}, status=status.HTTP_400_BAD_REQUEST)



class UserRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
     
    # Allow only authenticated users to access this url
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CustomUserSerializer
 
    def get(self, request, *args, **kwargs):
        # serializer to handle turning our `User` object into something that
        # can be JSONified and sent to the client.
        serializer = self.serializer_class(request.user)
 
        return Response(serializer.data, status=status.HTTP_200_OK)
 
    def put(self, request, *args, **kwargs):
        serializer_data = request.data.get('user', {})
 
        serializer = CustomUserSerializer(
            request.user, data=serializer_data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
 
        return Response(serializer.data, status=status.HTTP_200_OK)