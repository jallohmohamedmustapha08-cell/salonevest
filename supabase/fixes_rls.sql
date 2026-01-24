-- Fix RLS by using a Security Definer function to decouple permission checks
-- This ensures that checking conversation participants doesn't run into RLS recursion issues or context limits.

create or replace function public.is_chat_participant(conversation_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from conversations
    where id = conversation_uuid
    and (participant1_id = auth.uid() or participant2_id = auth.uid())
  );
end;
$$ language plpgsql security definer;

-- Drop existing policies that might be problematic
drop policy if exists "Users can view messages in their conversations" on messages;
drop policy if exists "Users can send messages" on messages;

-- Re-create policies using the new function
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    sender_id = auth.uid() or
    is_chat_participant(conversation_id) or 
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can send messages"
  on messages for insert
  with check (
    is_chat_participant(conversation_id)
  );

-- Ensure Realtime has access (Commented out as it's already added)
-- alter publication supabase_realtime add table messages;
