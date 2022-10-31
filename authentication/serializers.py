from .models import CustomUser
from rest_framework import serializers


class CustomUserSerializer(serializers.ModelSerializer):
    """
    Currently unused in preference of the below.
    """
    email = serializers.EmailField(
        required=True
    )
    password = serializers.CharField(min_length=8, write_only=True, required=True)
    first_name = serializers.CharField(max_length=100)
    gender = serializers.CharField(max_length=100)

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'user_firstname', 'gender')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print(validated_data)
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        if password is not None:
            instance.set_password(password)
        instance.save()
        print(instance)
        return instance