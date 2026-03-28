#!/bin/sh
PASSWORD=$(cat /secrets/redis_password)
exec redis-server --requirepass "$PASSWORD"
