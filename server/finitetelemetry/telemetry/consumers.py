import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.authtoken.models import Token
from .serializers import TelemetrySerializer

class TelemtryInputConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.group_name = 'telemetryinput'
        super().__init__(*args, **kwargs)

    async def connect(self):
        await self.channel_layer.group_add(
            self.group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        if self.scope['user'].id:
            data = json.loads(text_data)
            channel_layer = get_channel_layer()
            if 'command' in data:
                await channel_layer.group_send('telemetryoutput', {
                    'type': 'telemetryoutput.event',
                    'data': data
                })
                return
                
            serializer = TelemetrySerializer(data=data, many=False)
            serializer.is_valid(raise_exception=True)
            await database_sync_to_async(save_serializer)(serializer)
            # serializer.save()
            #serializer = TwitchEventSerializer(instance=instance)
            # data = serializer.data
            await channel_layer.group_send('telemetryoutput', {
                'type': 'telemetryoutput.event',
                'data': serializer.data
            })
        else:
            try:
                data = json.loads(text_data)
                if 'token' in data.keys():
                    token = data['token']
                    user = await database_sync_to_async(self.get_user_from_token)(token)
                    self.scope['user'] = user
            except Exception as err:
                print(err)
        if not self.scope['user'].id:
            print('No user found with submitted token.  Closing connection.')
            self.close()

    def get_user_from_token(self, token):
        user = Token.objects.get(key=token).user
        return user


class TelemtryOutputConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.group_name = 'telemetryoutput'
        super().__init__(*args, **kwargs)

    async def connect(self):
        await self.channel_layer.group_add(
            self.group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        if self.scope['user'].id:
            pass
        else:
            try:
                data = json.loads(text_data)
                if 'token' in data.keys():
                    token = data['token']
                    user = await database_sync_to_async(self.get_user_from_token)(token)
                    self.scope['user'] = user
            except Exception as err:
                print(err)
        if not self.scope['user'].id:
            print('No user found with submitted token.  Closing connection.')
            self.close()

    async def telemetryoutput_event(self, event):
        if self.scope['user'].id:
            await self.send_json(event['data'])

    def get_user_from_token(self, token):
        user = Token.objects.get(key=token).user
        return user


def save_serializer(serializer):
    serializer.save()
