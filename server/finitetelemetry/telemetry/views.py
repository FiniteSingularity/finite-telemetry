from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .serializers import TelemetrySerializer
from .models import Telemetry

# Create your views here.
class TelemetryViewSet(viewsets.ModelViewSet):
    """
    Updates and retrieves telemetry data
    """
    queryset = Telemetry.objects.all()
    serializer_class = TelemetrySerializer
    permission_classes = (IsAuthenticated,)