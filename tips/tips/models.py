from django.db import models

# Create your models here.
class Tip(models.Model):
    tipId = models.IntegerField(default=0, primary_key=True)
    text = models.CharField(default="", max_length=250)
    category = models.CharField(default="", max_length=150)

    def __str__(self):
        return str(self.tipId)

class tipSubscriber(models.Model):
    phoneNumber = models.IntegerField(default=0, primary_key=True)
    tipsShared = models.ManyToManyField(Tip)
    subscribedDate = models.DateField()

    def __str__(self):
        return str(self.phoneNumber)
