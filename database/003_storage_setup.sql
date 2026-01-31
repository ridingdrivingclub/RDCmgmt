-- =====================================================
-- RIDING & DRIVING CLUB - DIGITAL GARAGE
-- Storage Bucket Configuration
-- =====================================================
-- Run this AFTER the schema and security policies
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'vehicle-images',
    'vehicle-images',
    TRUE,  -- Public so images can be displayed
    10485760,  -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'documents',
    'documents',
    FALSE,  -- Private - requires authentication
    52428800,  -- 50MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'avatars',
    'avatars',
    TRUE,  -- Public for profile images
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - Vehicle Images (Public bucket)
-- =====================================================

-- Anyone can view vehicle images (public)
CREATE POLICY "Vehicle images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

-- Admins can upload vehicle images
CREATE POLICY "Admins can upload vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can update vehicle images
CREATE POLICY "Admins can update vehicle images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vehicle-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can delete vehicle images
CREATE POLICY "Admins can delete vehicle images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- STORAGE POLICIES - Documents (Private bucket)
-- =====================================================

-- Users can view their own documents
-- Document path format: documents/{owner_id}/{vehicle_id}/{filename}
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (
      -- Admin can see all
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
      OR
      -- User can see their own (path starts with their user id)
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Admins can upload any document
CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Users can upload to their own folder
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can update any document
CREATE POLICY "Admins can update documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can delete any document
CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- STORAGE POLICIES - Avatars (Public bucket)
-- =====================================================

-- Anyone can view avatars
CREATE POLICY "Avatars are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
-- Avatar path format: avatars/{user_id}/{filename}
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can manage any avatar
CREATE POLICY "Admins can manage avatars"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
