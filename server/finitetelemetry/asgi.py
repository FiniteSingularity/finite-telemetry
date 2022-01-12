
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "finitetelemetry.config")
os.environ.setdefault("DJANGO_CONFIGURATION", "Local")

import configurations
configurations.setup()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path

import finitetelemetry.telemetry.consumers as telemetryconsumers

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            [
                re_path(r'ws/telemetry/input/$', telemetryconsumers.TelemtryInputConsumer.as_asgi()),
                re_path(r'ws/telemetry/output/$', telemetryconsumers.TelemtryOutputConsumer.as_asgi())
            ]
        )
    ),
})