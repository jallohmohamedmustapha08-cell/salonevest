-- Promote the user to Admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@salonevest.com';

-- Verify the update
SELECT * FROM public.profiles WHERE email = 'admin@salonevest.com';
