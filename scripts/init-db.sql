-- Initialize database for FastAPI backend

-- Create database if it doesn't exist
-- (PostgreSQL will use the database specified in POSTGRES_DB env var)

-- Grant necessary permissions
-- GRANT ALL PRIVILEGES ON DATABASE fastapi_db TO postgres;

-- The application will create tables via Alembic migrations