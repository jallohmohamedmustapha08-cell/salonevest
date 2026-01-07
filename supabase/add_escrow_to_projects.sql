-- Add released column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS released NUMERIC DEFAULT 0;

-- RPC Function to release funds
CREATE OR REPLACE FUNCTION release_funds(project_id_arg BIGINT, amount_arg NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_funding NUMERIC;
    current_released NUMERIC;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN json_build_object('error', 'Unauthorized: Only admins can release funds');
    END IF;

    -- Get current project stats
    SELECT funding, released INTO current_funding, current_released
    FROM public.projects
    WHERE id = project_id_arg;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Project not found');
    END IF;

    -- Initialize released if null
    current_released := COALESCE(current_released, 0);
    current_funding := COALESCE(current_funding, 0);

    -- specific check for releasing more than available
    IF (current_released + amount_arg) > current_funding THEN
        RETURN json_build_object('error', 'Cannot release more than total funding raised');
    END IF;

    -- Update Project Released Amount
    UPDATE public.projects
    SET released = current_released + amount_arg
    WHERE id = project_id_arg;

    RETURN json_build_object('success', true, 'new_released', current_released + amount_arg);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
