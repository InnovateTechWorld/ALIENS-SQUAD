-- RecyclePay Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    virtual_account_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bins Table
CREATE TABLE IF NOT EXISTS bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_id VARCHAR(20) UNIQUE NOT NULL,
    location TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active Sessions Table
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_id VARCHAR(20) NOT NULL REFERENCES bins(bin_id) ON DELETE CASCADE,
    user_phone VARCHAR(20) NOT NULL REFERENCES users(phone) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(bin_id)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_phone VARCHAR(20) NOT NULL REFERENCES users(phone) ON DELETE CASCADE,
    bin_id VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('recycle', 'withdrawal')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_bins_bin_id ON bins(bin_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_bin_id ON active_sessions(bin_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_phone ON active_sessions(user_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_user_phone ON transactions(user_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM active_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert demo bins
INSERT INTO bins (bin_id, location, status) VALUES
    ('001', 'Lagos Island, Victoria Island', 'active'),
    ('002', 'Ikeja, Allen Avenue', 'active'),
    ('003', 'Lekki Phase 1, Admiralty Way', 'active')
ON CONFLICT (bin_id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for demo purposes - tighten in production)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all bins" ON bins FOR SELECT USING (true);
CREATE POLICY "Enable insert for all bins" ON bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all bins" ON bins FOR UPDATE USING (true);

CREATE POLICY "Enable all access for active_sessions" ON active_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access for transactions" ON transactions FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bins TO anon, authenticated;
GRANT ALL ON active_sessions TO anon, authenticated;
GRANT ALL ON transactions TO anon, authenticated;
