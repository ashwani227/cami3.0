from django.db import models
from django_mysql.models import ListCharField

class goalSubscriber(models.Model):
    subscriptionKey= models.IntegerField(default=0, primary_key=True)
    subscribedDate = models.DateField()
    resources = ListCharField(default = "",base_field=models.CharField(max_length=500),size=100,max_length=(500 * 101))
	

    def __str__(self):
        return str(self.subscriptionKey)
