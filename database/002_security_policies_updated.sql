-- =====================================================
-- RIDING & DRIVING CLUB - DIGITAL GARAGE
-- UPDATED Row Level Security (RLS) Policies
-- =====================================================
-- This file contains ADDITIONAL policies to allow clients
-- to manage their own vehicles and service records.
-- Run this AFTER the original 002_security_policies.sql
-- =====================================================

-- =====================================================
-- VEHICLES - Client Self-Management
-- =====================================================

-- Clients can insert their own vehicles
CREATE POLICY "Clients can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Clients can update their own vehicles
CREATE POLICY "Clients can update own vehicles"
  ON vehicles FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Clients can soft-delete their own vehicles (set is_active = false)
CREATE POLICY "Clients can delete own vehicles"
  ON vehicles FOR DELETE
  USING (owner_id = auth.uid());

-- =====================================================
-- VEHICLE IMAGES - Client Self-Management
-- =====================================================

-- Clients can add images to their own vehicles
CREATE POLICY "Clients can insert own vehicle images"
  ON vehicle_images FOR INSERT
  WITH CHECK (owns_vehicle(vehicle_id));

-- Clients can update images of their own vehicles
CREATE POLICY "Clients can update own vehicle images"
  ON vehicle_images FOR UPDATE
  USING (owns_vehicle(vehicle_id))
  WITH CHECK (owns_vehicle(vehicle_id));

-- Clients can delete images from their own vehicles
CREATE POLICY "Clients can delete own vehicle images"
  ON vehicle_images FOR DELETE
  USING (owns_vehicle(vehicle_id));

-- =====================================================
-- SERVICE RECORDS - Client Self-Management
-- =====================================================

-- Clients can add service records to their own vehicles
CREATE POLICY "Clients can insert own service records"
  ON service_records FOR INSERT
  WITH CHECK (owns_vehicle(vehicle_id));

-- Clients can update service records for their own vehicles
CREATE POLICY "Clients can update own service records"
  ON service_records FOR UPDATE
  USING (owns_vehicle(vehicle_id))
  WITH CHECK (owns_vehicle(vehicle_id));

-- Clients can delete service records from their own vehicles
CREATE POLICY "Clients can delete own service records"
  ON service_records FOR DELETE
  USING (owns_vehicle(vehicle_id));

-- =====================================================
-- SERVICE DOCUMENTS - Client Self-Management
-- =====================================================

-- Clients can add documents to service records for their vehicles
CREATE POLICY "Clients can insert own service documents"
  ON service_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_records sr
      JOIN vehicles v ON sr.vehicle_id = v.id
      WHERE sr.id = service_record_id
      AND v.owner_id = auth.uid()
    )
  );

-- Clients can delete documents from their service records
CREATE POLICY "Clients can delete own service documents"
  ON service_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM service_records sr
      JOIN vehicles v ON sr.vehicle_id = v.id
      WHERE sr.id = service_documents.service_record_id
      AND v.owner_id = auth.uid()
    )
  );

-- =====================================================
-- APPOINTMENTS - Client Self-Management
-- =====================================================

-- Clients can create their own appointments
CREATE POLICY "Clients can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- =====================================================
-- STORAGE BUCKET POLICIES (run in SQL editor)
-- =====================================================
-- Note: These may need to be run separately in the Supabase dashboard
-- under Storage > Policies

-- For vehicle-images bucket - allow authenticated users to upload to their folder
-- Policy: Allow users to upload images for their own vehicles
-- CREATE POLICY "Users can upload own vehicle images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'vehicle-images'
--   AND auth.role() = 'authenticated'
-- );

-- For documents bucket - allow authenticated users to upload to their folder
-- Policy: Allow users to upload their own documents
-- CREATE POLICY "Users can upload own documents"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'documents'
--   AND auth.role() = 'authenticated'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );
