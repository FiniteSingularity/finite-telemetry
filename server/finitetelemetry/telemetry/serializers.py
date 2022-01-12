from rest_framework import serializers
from .models import Telemetry

class TelemetrySerializer(serializers.ModelSerializer):

    class Meta:
        model = Telemetry
        fields = (
            'id',
            'timestamp',
            'latitude',
            'longitude',
            'altitude',
            'accuracy',
            'altitude_accuracy',
            'speed',
            'bearing'
        )
        read_only_fields = ('id', )