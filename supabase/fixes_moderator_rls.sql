-- UPDATING RLS POLICIES TO INCLUDE 'MODERATOR' ROLE

-- 1. Agent Verifications (agent_verifications)
-- Allow moderators to VIEW verifications (same read access as staff/admin)
DROP POLICY IF EXISTS "Staff and Admin can view verifications" ON agent_verifications;
CREATE POLICY "Staff, Admin, Moderator can view verifications"
  ON agent_verifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin', 'moderator')
    )
  );

-- 2. Conversations
-- Allow moderators to VIEW all conversations (for oversight)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users view own, Admin/Mod view all conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'moderator')
    )
  );

-- 3. Messages
-- Allow moderators to VIEW all messages (for oversight)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users view own, Admin/Mod view all messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.participant1_id = auth.uid() OR 
        conversations.participant2_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'moderator')
    )
  );

-- 4. Verification Reports (Project Reports)
-- Allow moderators to VIEW reports (same as admin)
DROP POLICY IF EXISTS "Admins can see all reports" ON verification_reports;
CREATE POLICY "Admins and Moderators can see all reports"
ON verification_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);
