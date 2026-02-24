-- Create models table
CREATE TABLE models (
  id SMALLINT PRIMARY KEY CHECK (id >= 0 AND id < 24),
  hub TEXT NOT NULL,
  data TEXT,
  timestamp BIGINT NOT NULL,
  hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Allow public read/write
CREATE POLICY "Public read" ON models FOR SELECT USING (true);
CREATE POLICY "Public insert" ON models FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON models FOR UPDATE USING (true);

-- Index for fast lookups
CREATE INDEX idx_models_timestamp ON models(timestamp DESC);

-- Function to upsert with timestamp check
CREATE OR REPLACE FUNCTION upsert_model(
  p_id SMALLINT,
  p_hub TEXT,
  p_data TEXT,
  p_timestamp BIGINT,
  p_hash TEXT
) RETURNS SETOF models AS $$
BEGIN
  RETURN QUERY
  INSERT INTO models (id, hub, data, timestamp, hash)
  VALUES (p_id, p_hub, p_data, p_timestamp, p_hash)
  ON CONFLICT (id) DO UPDATE
  SET hub = EXCLUDED.hub,
      data = EXCLUDED.data,
      timestamp = EXCLUDED.timestamp,
      hash = EXCLUDED.hash
  WHERE EXCLUDED.timestamp > models.timestamp
  RETURNING *;
END;
$$ LANGUAGE plpgsql;
