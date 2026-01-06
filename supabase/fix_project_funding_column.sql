-- Rename the column to match the frontend and RPC function expectations
ALTER TABLE public.projects 
RENAME COLUMN funding_raised TO funding;
