-- Create a table for conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  participant1_id uuid references profiles(id) not null,
  participant2_id uuid references profiles(id) not null,
  last_message_preview text,
  last_message_time timestamp with time zone,
  -- Ensure unique pair of participants (order matters or use a constraint to sort)
  -- For simplicity, we can rely on application logic to always sort ids or check both combinations, 
  -- but a unique constraint is better.
  constraint unique_participants unique (participant1_id, participant2_id)
);

-- Index for faster lookups
create index conversations_participant1_idx on conversations(participant1_id);
create index conversations_participant2_idx on conversations(participant2_id);

-- Create a table for messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false
);

-- Index for retrieving messages by conversation
create index messages_conversation_id_idx on messages(conversation_id);

-- Enable RLS
alter table conversations enable row level security;
alter table messages enable row level security;

-- Policies for Conversations

-- Users can view conversations they are part of
create policy "Users can view their own conversations"
  on conversations for select
  using (
    auth.uid() = participant1_id or 
    auth.uid() = participant2_id or
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Users can insert conversations if they are one of the participants
create policy "Users can create conversations"
  on conversations for insert
  with check (
    auth.uid() = participant1_id or 
    auth.uid() = participant2_id
  );

-- Policies for Messages

-- Users can view messages in conversations they belong to
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (
        conversations.participant1_id = auth.uid() or 
        conversations.participant2_id = auth.uid()
      )
    ) or
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Users can insert messages if they are part of the conversation
create policy "Users can send messages"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (
        conversations.participant1_id = auth.uid() or 
        conversations.participant2_id = auth.uid()
      )
    )
  );

-- Helper function to update updated_at on new message
create or replace function public.handle_new_message() 
returns trigger as $$
begin
  update conversations
  set updated_at = now(),
      last_message_preview = left(new.content, 50),
      last_message_time = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_message
  after insert on messages
  for each row execute procedure public.handle_new_message();
