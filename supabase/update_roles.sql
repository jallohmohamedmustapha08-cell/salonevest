-- Drop the existing constraint
-- Note: The constraint name 'profiles_role_check' is the default generic name postgres assigns.
-- If this fails, you might need to check the exact constraint name in your database.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint with expanded roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('investor', 'entrepreneur', 'admin', 'staff', 'field_agent', 'verifier', 'moderator'));
