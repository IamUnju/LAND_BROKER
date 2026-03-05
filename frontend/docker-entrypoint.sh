#!/bin/sh
set -e

echo "=== Environment Check ==="
echo "BACKEND_URL env var is: ${BACKEND_URL}"
echo "========================="

# Replace placeholders with actual env vars
echo "Generating nginx config..."
sed -e "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" \
    -e "s|PORT_PLACEHOLDER|${PORT:-80}|g" \
    /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "=== Generated nginx config ==="
cat /etc/nginx/conf.d/default.conf
echo "=============================="

# Test nginx config
echo "Testing nginx configuration..."
nginx -t

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'
