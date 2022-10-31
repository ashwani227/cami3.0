from rest_framework import serializers
from .models import Bugs

class BugSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Bugs
        fields = ['session_id', 'chat_file','report_message']