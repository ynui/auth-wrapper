#!/bin/sh
if [ -z "$REDIS_PASSWORD_FILE" ]; then
    echo "REDIS_PASSWORD_FILE is not set"
    exit 1
fi

echo "Starting Redis with password: $PASSWORD"
exec redis-server --requirepass "$PASSWORD"
