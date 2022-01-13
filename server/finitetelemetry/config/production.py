import os
from .common import Common


class Production(Common):
    INSTALLED_APPS = Common.INSTALLED_APPS

    ins = list(Common.MIDDLEWARE).index('django.middleware.security.SecurityMiddleware')
    if ins:
        MIDDLEWARE=list(Common.MIDDLEWARE)
        MIDDLEWARE.insert(ins+1, 'whitenoise.middleware.WhiteNoiseMiddleware')
        MIDDLEWARE=tuple(MIDDLEWARE)
    
