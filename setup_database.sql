-- Create app_config table for single-user mode
-- This table stores all user data with id = 1

CREATE TABLE IF NOT EXISTS app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    github_username TEXT,
    leetcode_username TEXT,
    resume_file_path TEXT,
    resume_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial row if it doesn't exist
INSERT INTO app_config (id, github_username, leetcode_username, resume_file_path, resume_text)
SELECT 1, '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM app_config WHERE id = 1);

-- Create storage bucket for resumes
-- This needs to be created manually in Supabase dashboard:
-- Bucket name: "resumes"
-- Public access: No (private)
-- Allowed file types: .pdf
