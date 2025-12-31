-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roadmap_steps table
CREATE TABLE IF NOT EXISTS roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    youtube_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Create RLS policies for roadmaps table
CREATE POLICY "Users can view own roadmaps" ON roadmaps
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps" ON roadmaps
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps" ON roadmaps
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmaps" ON roadmaps
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create RLS policies for roadmap_steps table
CREATE POLICY "Users can view steps of own roadmaps" ON roadmap_steps
    FOR SELECT TO authenticated
    USING (
        roadmap_id IN (
            SELECT id FROM roadmaps WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert steps for own roadmaps" ON roadmap_steps
    FOR INSERT TO authenticated
    WITH CHECK (
        roadmap_id IN (
            SELECT id FROM roadmaps WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update steps of own roadmaps" ON roadmap_steps
    FOR UPDATE TO authenticated
    USING (
        roadmap_id IN (
            SELECT id FROM roadmaps WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete steps of own roadmaps" ON roadmap_steps
    FOR DELETE TO authenticated
    USING (
        roadmap_id IN (
            SELECT id FROM roadmaps WHERE user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_steps_roadmap_id ON roadmap_steps(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_created_at ON roadmaps(created_at DESC);