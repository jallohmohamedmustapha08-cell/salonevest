-- Update invest RPC to accept payment details
CREATE OR REPLACE FUNCTION invest(
    project_id_arg BIGINT, 
    investor_id_arg UUID, 
    amount_arg NUMERIC,
    payment_method_arg TEXT DEFAULT 'mobile_money',
    tx_hash_arg TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_funding NUMERIC;
    target_goal NUMERIC;
BEGIN
    -- Check if project exists and get current stats
    SELECT funding, goal INTO new_funding, target_goal
    FROM public.projects
    WHERE id = project_id_arg;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Project not found');
    END IF;

    -- Insert Investment Record with new fields
    INSERT INTO public.investments (project_id, investor_id, amount, payment_method, tx_hash)
    VALUES (project_id_arg, investor_id_arg, amount_arg, payment_method_arg, tx_hash_arg);

    -- Update Project Funding
    UPDATE public.projects
    SET funding = COALESCE(funding, 0) + amount_arg
    WHERE id = project_id_arg;

    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
