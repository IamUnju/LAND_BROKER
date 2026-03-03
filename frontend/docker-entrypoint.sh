#!/bin/sh
set -e

echo "=== Environment Check ==="
echo "BACKEND_URL env var is: ${BACKEND_URL}"
echo "========================="

# Replace BACKEND_URL_PLACEHOLDER with actual BACKEND_URL env var
sed "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "=== Generated nginx config ==="
cat /etc/nginx/conf.d/default.conf
echo "=============================="

# Start nginx
exec nginx -g 'daemon off;'
