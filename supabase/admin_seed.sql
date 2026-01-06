-- Enable pgcrypto extension for password hashing
create extension if not exists pgcrypto;

-- Insert a new admin user into auth.users
-- The existing trigger 'on_auth_user_created' will automatically create the profile ENTRY in public.profiles
-- with the role 'admin' specified in raw_user_meta_data.

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@salonevest.com',
  crypt('Admin@123', gen_salt('bf')),
  now(), 
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"System Admin","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);
