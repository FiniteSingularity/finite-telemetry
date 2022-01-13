#!/bin/bash
./wait_for_postgres.py && \
./manage.py migrate && \
./manage.py collectstatic --noinput && \
daphne finitetelemetry.asgi:application -b 0.0.0.0 -p "$PORT"
