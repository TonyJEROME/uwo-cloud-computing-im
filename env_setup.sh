#!/bin/bash
set -e
cd "$(dirname "$0")"

ENV_FILE=".env"

sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DB_URL}|" $ENV_FILE
sed -i "s|^DATABASE_PASSWORD=.*|DATABASE_PASSWORD=${DB_PASSWORD}|" $ENV_FILE