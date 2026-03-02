#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
max_retries=30
retry_count=0

# Create a Python script to test database connection
python3 << 'EOF' > /tmp/test_db.py
import asyncio
import asyncpg
import sys
from urllib.parse import urlparse

async def test_connection():
    try:
        # Parse DATABASE_URL
        url = "$DATABASE_URL"
        parsed = urlparse(url)
        
        # Extract connection parameters
        conn = await asyncpg.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path.lstrip('/')
        )
        await conn.close()
        return True
    except Exception as e:
        print(f"Failed: {e}", file=sys.stderr)
        return False

if asyncio.run(test_connection()):
    sys.exit(0)
else:
    sys.exit(1)
EOF

while [ $retry_count -lt $max_retries ]; do
    if python3 /tmp/test_db.py 2>/dev/null; then
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
fi

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
