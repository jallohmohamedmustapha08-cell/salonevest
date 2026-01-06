-- Add assigned_staff_id to projects table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'assigned_staff_id') THEN
        ALTER TABLE projects ADD COLUMN assigned_staff_id uuid REFERENCES profiles(id);
    END IF;
END $$;
