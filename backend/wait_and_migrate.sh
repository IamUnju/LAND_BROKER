#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if python3 -c "
import asyncio, asyncpg
from urllib.parse import urlparse
import os

async def test():
    try:
        url = os.getenv('DATABASE_URL')
        parsed = urlparse(url)
        conn = await asyncpg.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path.lstrip('/')
        )
        await conn.close()
        return True
    except:
        return False

exit(0 if asyncio.run(test()) else 1)
" 2>/dev/null; then
        echo "Database is ready!"
        break
    fi
    retry_count=$((retry_count + 1))
    echo "Database not ready, waiting... ($retry_count/$max_retries)"
    sleep 1
done

if [ $retry_count -eq $max_retries ]; then
    echo "Database didn't become ready in time. Skipping migrations."
else
    echo "Running migrations..."
    alembic upgrade head || echo "Migrations failed, continuing anyway..."
    
    # Run seed script if RUN_SEED env var is set to "true"
    if [ "$RUN_SEED" = "true" ]; then
        echo "Running seed script..."
        python seed.py || echo "Seed script failed, continuing anyway..."
    fi
fi

echo "Starting application..."
# Use PORT environment variable if set by Railway, otherwise default to 8000
PORT=${PORT:-8000}
# Trust Railway forwarding headers so generated redirect URLs keep https scheme
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --proxy-headers --forwarded-allow-ips="*" --log-level debug
