-- FIX RLS Policies to allow data visibility

-- 1. Allow all authenticated users to view profiles
-- This fixes the issue where Staff cannot see Field Agents because they couldn't query the profiles table.
-- We drop the policy first to avoid "policy already exists" errors if re-running.
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone"
  on profiles for select
  to authenticated
  using ( true );

-- 2. Fix policies for verify/revert on agent_verifications
-- Ensure table has RLS enabled
alter table agent_verifications enable row level security;

-- Drop old policies to ensure clean slate
drop policy if exists "Staff can view verifications" on agent_verifications;
drop policy if exists "Staff can insert verifications" on agent_verifications;
drop policy if exists "Staff/Admin can view all verifications" on agent_verifications;
drop policy if exists "Staff/Admin can insert verifications" on agent_verifications;
drop policy if exists "Admins can update/delete verifications" on agent_verifications;

-- Create new robust policies
create policy "Staff and Admin can view verifications"
  on agent_verifications for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );

create policy "Staff and Admin can insert verifications"
  on agent_verifications for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('staff', 'admin')
    )
  );

create policy "Admins can update/delete verifications"
  on agent_verifications for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
