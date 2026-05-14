-- Migration: Add status column to active_sessions table
-- Run this in your Supabase SQL Editor

-- Add status column
ALTER TABLE active_sessions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'waiting';

-- Add check constraint
ALTER TABLE active_sessions 
ADD CONSTRAINT active_sessions_status_check 
CHECK (status IN ('waiting', 'verifying', 'success', 'failed'));

-- Update existing rows to have 'waiting' status
UPDATE active_sessions SET status = 'waiting' WHERE status IS NULL;
