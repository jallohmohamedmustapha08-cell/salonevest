-- Enable Realtime for Chat Messages
begin;
  -- Add messages table to the realtime publication
  alter publication supabase_realtime add table messages;
commit;

-- Allow Entrepreneurs to see who invested in their projects
create policy "Entrepreneurs can view investments for their projects"
on investments
for select
using (
  project_id in (
    select id from projects where entrepreneur_id = auth.uid()
  )
);
