#!/bin/sh
gunicorn --name 'Gunicorn App Gevent' --chdir /app/src --bind 0.0.0.0:$SERVER_PORT server:app -k gevent --worker-connections $GUWORKERS_CONNECTIONS --workers $GUWORKERS --log-file /app/gunicorn.log
