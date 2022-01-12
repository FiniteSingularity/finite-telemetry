from django.db import models

# Create your models here.
class Telemetry(models.Model):
    timestamp = models.DateTimeField()
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    altitude = models.FloatField()
    accuracy = models.FloatField()
    altitude_accuracy = models.FloatField()
    speed = models.FloatField(blank=True, null=True)
    bearing = models.FloatField(blank=True, null=True)
    