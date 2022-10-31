from tokenize import Triple
from django.db import models

def upload_path(instance, filname):
    return instance.session_id + ".png"

class Bugs(models.Model):
    session_id = models.CharField(max_length=32, blank=False)
    chat_file = models.ImageField(blank=True, null=True, upload_to=upload_path)
    report_message = models.CharField(max_length=999, blank=True)
