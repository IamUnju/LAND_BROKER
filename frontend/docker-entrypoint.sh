#!/bin/sh
set -e

echo "=== Starting BrokerSaaS Frontend ==="
echo "PORT: ${PORT:-80}"

# Replace PORT_PLACEHOLDER with actual PORT
sed "s|PORT_PLACEHOLDER|${PORT:-80}|g" \
    /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

nginx -t
exec nginx -g 'daemon off;'