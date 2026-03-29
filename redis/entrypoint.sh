#!/bin/sh
if [ -z "$REDIS_PASSWORD_FILE" ]; then
    echo "REDIS_PASSWORD_FILE is not set"
    exit 1
fi

PASSWORD=$(cat "$REDIS_PASSWORD_FILE")
if [ -z "$PASSWORD" ]; then
    echo "Password file is empty"
    exit 1
fi

exec redis-server --requirepass "$PASSWORD"
