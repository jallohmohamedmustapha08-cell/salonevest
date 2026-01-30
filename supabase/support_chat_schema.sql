-- Support Tickets Table
create table support_tickets (
  id uuid default gen_random_uuid() primary key,
  guest_name text not null,
  guest_email text not null,
  status text default 'open' check (status in ('open', 'closed', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Support Messages Table
create table support_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references support_tickets(id) on delete cascade not null,
  sender_type text check (sender_type in ('guest', 'moderator')),
  -- sender_id is null for guests, profile_id for moderators
  sender_id uuid references profiles(id), 
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false
);

-- Indexes
create index support_messages_ticket_id_idx on support_messages(ticket_id);
create index support_tickets_created_at_idx on support_tickets(created_at desc);

-- RLS Policies
alter table support_tickets enable row level security;
alter table support_messages enable row level security;

-- 1. Moderators can view/edit everything
create policy "Moderators can view all tickets"
  on support_tickets for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and (profiles.role = 'moderator' or profiles.role = 'admin')
    )
  );

create policy "Moderators can view all messages"
  on support_messages for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and (profiles.role = 'moderator' or profiles.role = 'admin')
    )
  );

create policy "Moderators can insert messages"
  on support_messages for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and (profiles.role = 'moderator' or profiles.role = 'admin')
    )
  );

create policy "Moderators can update tickets"
  on support_tickets for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and (profiles.role = 'moderator' or profiles.role = 'admin')
    )
  );

-- 2. Public/Guests (handled via Server Actions usually, but if we need direct access)
-- We will rely on Server Actions with `supabase-admin` (service role) for Guest interactions to ensure security 
-- (e.g. validating email matches ticket ID before returning history).
-- So strictly speaking, we don't *need* public RLS if we use Service Role in Actions.
-- However, for robustness, we can allow INSERTs if necessary, but purely Server Action approach is safer for "Guests".

-- 3. Trigger to update last_message_at
create or replace function public.update_ticket_timestamp() 
returns trigger as $$
begin
  update support_tickets
  set last_message_at = now()
  where id = new.ticket_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_support_message
  after insert on support_messages
  for each row execute procedure public.update_ticket_timestamp();
