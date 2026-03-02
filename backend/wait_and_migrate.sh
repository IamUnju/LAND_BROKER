#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if python -c "import asyncpg; import asyncio; asyncio.run(asyncpg.connect('$DATABASE_URL'))" 2>/dev/null; then
        echo "Database is ready!"
        break
    fi
    retry_count=$((retry_count + 1))
    echo "Database not ready, waiting... ($retry_count/$max_retries)"
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    echo "Database didn't become ready in time. Skipping migrations."
else
    echo "Running migrations..."
    alembic upgrade head || echo "Migrations failed, continuing anyway..."
fi

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
