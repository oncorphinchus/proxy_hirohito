-- This SQL can be run in the Supabase SQL Editor to set up the required tables
-- Create the server_stats table

CREATE TABLE IF NOT EXISTS public.server_stats (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    cpu_percent FLOAT4,
    ram_percent FLOAT4,
    disk_percent FLOAT4,
    proxy_active BOOLEAN,
    network_rx_bytes BIGINT,
    network_tx_bytes BIGINT
);

-- Set up row level security (RLS) policies
ALTER TABLE public.server_stats ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read data
CREATE POLICY "Allow anyone to read server stats" 
ON public.server_stats
FOR SELECT 
TO authenticated
USING (true);

-- Create a policy that allows only specific users to insert data (update this with your requirements)
CREATE POLICY "Allow specific users to insert server stats" 
ON public.server_stats
FOR INSERT 
TO authenticated
USING (true);  -- You may want to restrict this further in production

-- Create an index on the created_at column for better query performance
CREATE INDEX IF NOT EXISTS idx_server_stats_created_at
ON public.server_stats (created_at DESC);

-- Example: Function to clean up old data to prevent table from growing too large
CREATE OR REPLACE FUNCTION clean_old_server_stats()
RETURNS void AS $$
BEGIN
  -- Delete records older than 30 days
  DELETE FROM public.server_stats
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optionally set up a scheduled job to clean up old data
-- Uncomment and run this in the SQL editor if you want this feature
/*
SELECT cron.schedule(
  'cleanup-server-stats',  -- job name
  '0 0 * * *',             -- run at midnight every day (cron syntax)
  $$SELECT clean_old_server_stats()$$
);
*/

-- Note: The cron extension needs to be enabled for the scheduled job 