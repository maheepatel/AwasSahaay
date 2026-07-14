-- Create enum types if not exists, otherwise use standard text constraints
-- We'll use text checks for maximum portability and ease of updates

-- 1. Societies
CREATE TABLE IF NOT EXISTS societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Users (extends auth.users in Supabase, but created as a public profile table)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- matches auth.users.id
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Memberships
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('resident', 'tenant', 'secretary', 'asst_secretary', 'treasurer')) NOT NULL,
    flat_number TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    presence_status TEXT DEFAULT 'offline' CHECK (presence_status IN ('online', 'offline', 'away')) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, society_id)
);

-- 4. Issues
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
    raised_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN ('water', 'electrical', 'security', 'plumbing', 'civil', 'other')) NOT NULL,
    description TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}'::text[] NOT NULL,
    status TEXT DEFAULT 'raised' CHECK (status IN ('raised', 'assigned', 'fixing', 'fixed', 'verified', 'reopened')) NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    escalation_level INTEGER DEFAULT 0 NOT NULL,
    sla_hours INTEGER DEFAULT 120 NOT NULL,
    raised_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    fixed_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    proof_media_urls TEXT[] DEFAULT '{}'::text[] NOT NULL
);

-- 5. Issue Activity Log
CREATE TABLE IF NOT EXISTS issue_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Append-Only Trigger on issue_activity_log
CREATE OR REPLACE FUNCTION block_update_delete_on_log()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates and Deletes are not allowed on issue_activity_log table!';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_update_delete_on_log
BEFORE UPDATE OR DELETE ON issue_activity_log
FOR EACH ROW EXECUTE FUNCTION block_update_delete_on_log();

-- 6. Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
    posted_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
    posted_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('critical', 'caution', 'info')) NOT NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Channels
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('general', 'announcements', 'alerts', 'feedback')) NOT NULL,
    UNIQUE(society_id, type)
);

-- Row-Level Security (RLS) policies scoped by society_id
-- Turn on RLS
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Add basic RLS select/insert/update policies based on society membership
-- Note: Simplified rules for local/production setup: user must belong to society_id to query.
