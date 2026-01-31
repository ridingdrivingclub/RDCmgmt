-- =====================================================
-- RIDING & DRIVING CLUB - DIGITAL GARAGE
-- Row Level Security (RLS) Policies
-- =====================================================
-- Run this AFTER 001_schema.sql
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user owns a vehicle
CREATE OR REPLACE FUNCTION owns_vehicle(vehicle_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicles
    WHERE id = vehicle_uuid
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Admins can insert profiles (for manual creation)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin());

-- =====================================================
-- INVITATIONS POLICIES
-- =====================================================

-- Only admins can view invitations
CREATE POLICY "Admins can view invitations"
  ON invitations FOR SELECT
  USING (is_admin());

-- Only admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update invitations
CREATE POLICY "Admins can update invitations"
  ON invitations FOR UPDATE
  USING (is_admin());

-- Allow public to check invitation by token (for signup flow)
CREATE POLICY "Public can check invitation by token"
  ON invitations FOR SELECT
  USING (TRUE); -- Token validation happens in application logic

-- =====================================================
-- VEHICLES POLICIES
-- =====================================================

-- Clients can view their own vehicles
CREATE POLICY "Clients can view own vehicles"
  ON vehicles FOR SELECT
  USING (owner_id = auth.uid());

-- Admins can view all vehicles
CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  USING (is_admin());

-- Admins can insert vehicles
CREATE POLICY "Admins can insert vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update any vehicle
CREATE POLICY "Admins can update vehicles"
  ON vehicles FOR UPDATE
  USING (is_admin());

-- Admins can delete vehicles
CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  USING (is_admin());

-- =====================================================
-- VEHICLE IMAGES POLICIES
-- =====================================================

-- Users can view images of their own vehicles
CREATE POLICY "Users can view own vehicle images"
  ON vehicle_images FOR SELECT
  USING (owns_vehicle(vehicle_id));

-- Admins can view all images
CREATE POLICY "Admins can view all vehicle images"
  ON vehicle_images FOR SELECT
  USING (is_admin());

-- Admins can manage images
CREATE POLICY "Admins can insert vehicle images"
  ON vehicle_images FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update vehicle images"
  ON vehicle_images FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete vehicle images"
  ON vehicle_images FOR DELETE
  USING (is_admin());

-- =====================================================
-- SERVICE RECORDS POLICIES
-- =====================================================

-- Users can view service records for their vehicles
CREATE POLICY "Users can view own service records"
  ON service_records FOR SELECT
  USING (owns_vehicle(vehicle_id));

-- Admins can view all service records
CREATE POLICY "Admins can view all service records"
  ON service_records FOR SELECT
  USING (is_admin());

-- Admins can manage service records
CREATE POLICY "Admins can insert service records"
  ON service_records FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update service records"
  ON service_records FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete service records"
  ON service_records FOR DELETE
  USING (is_admin());

-- =====================================================
-- SERVICE DOCUMENTS POLICIES
-- =====================================================

-- Users can view documents for their service records
CREATE POLICY "Users can view own service documents"
  ON service_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_records sr
      JOIN vehicles v ON sr.vehicle_id = v.id
      WHERE sr.id = service_documents.service_record_id
      AND v.owner_id = auth.uid()
    )
  );

-- Admins can manage service documents
CREATE POLICY "Admins can view all service documents"
  ON service_documents FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert service documents"
  ON service_documents FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete service documents"
  ON service_documents FOR DELETE
  USING (is_admin());

-- =====================================================
-- APPOINTMENTS POLICIES
-- =====================================================

-- Users can view their own appointments
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (owner_id = auth.uid());

-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (is_admin());

-- Admins can manage appointments
CREATE POLICY "Admins can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update appointments"
  ON appointments FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (is_admin());

-- Users can update their own appointments (limited - e.g., cancel)
CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- =====================================================
-- DOCUMENTS POLICIES
-- =====================================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (owner_id = auth.uid());

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (is_admin());

-- Admins can manage documents
CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (is_admin());

-- Users can upload their own documents
CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- =====================================================
-- CONVERSATIONS POLICIES
-- =====================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (client_id = auth.uid());

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT
  USING (is_admin());

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Admins can create conversations
CREATE POLICY "Admins can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update conversations (archive, etc.)
CREATE POLICY "Admins can update conversations"
  ON conversations FOR UPDATE
  USING (is_admin());

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.client_id = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (is_admin());

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_type = 'client'
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.client_id = auth.uid()
    )
  );

-- Admins can send messages (as concierge)
CREATE POLICY "Admins can send messages"
  ON messages FOR INSERT
  WITH CHECK (is_admin() AND sender_type = 'concierge');

-- Users can mark their messages as read
CREATE POLICY "Users can update message read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.client_id = auth.uid()
    )
  );

-- Admins can update any message
CREATE POLICY "Admins can update messages"
  ON messages FOR UPDATE
  USING (is_admin());

-- =====================================================
-- ACTIVITY LOG POLICIES
-- =====================================================

-- Only admins can view activity log
CREATE POLICY "Admins can view activity log"
  ON activity_log FOR SELECT
  USING (is_admin());

-- System can insert activity log (via function)
CREATE POLICY "System can insert activity log"
  ON activity_log FOR INSERT
  WITH CHECK (TRUE); -- Controlled via SECURITY DEFINER function
