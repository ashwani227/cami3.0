from django.db import models
from django_mysql.models import ListCharField


class Chat_module(models.Model):
    questionId = models.IntegerField(default=0, primary_key=True)
    category = models.JSONField(default=[], null=True)
    text = models.JSONField(default=[], null=True)
    buttons = models.JSONField(default=[], null=True)
    type = models.CharField(default="", max_length=150)
    functionCall = models.JSONField(default=[], null=True)

    def __str__(self):
        return str(self.questionId)
