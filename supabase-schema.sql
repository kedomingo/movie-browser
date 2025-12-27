-- Supabase table schema for recommendations cache
-- Run this SQL in your Supabase SQL editor to create the table

CREATE TABLE IF NOT EXISTS recommendations_cache (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('movie', 'tv')),
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create index on expires_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_recommendations_cache_expires_at ON recommendations_cache(expires_at);

-- Optional: Create a function to automatically clean up expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM recommendations_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

