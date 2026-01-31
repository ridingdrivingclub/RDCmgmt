import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations

// ============================================
// AUTH HELPERS
// ============================================

export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  return { data, error }
}

// ============================================
// PROFILE HELPERS
// ============================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// ============================================
// INVITATION HELPERS
// ============================================

export const createInvitation = async (email, fullName, invitedBy) => {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email,
      full_name: fullName,
      invited_by: invitedBy
    })
    .select()
    .single()
  return { data, error }
}

export const getInvitationByToken = async (token) => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()
  return { data, error }
}

export const getAllInvitations = async () => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, invited_by_profile:profiles!invited_by(full_name)')
    .order('created_at', { ascending: false })
  return { data, error }
}

// ============================================
// VEHICLE HELPERS
// ============================================

export const getVehicles = async (ownerId = null) => {
  let query = supabase
    .from('vehicles')
    .select(`
      *,
      owner:profiles!owner_id(id, full_name, email)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (ownerId) {
    query = query.eq('owner_id', ownerId)
  }

  const { data, error } = await query
  return { data, error }
}

export const getVehicle = async (vehicleId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      owner:profiles!owner_id(id, full_name, email),
      images:vehicle_images(*)
    `)
    .eq('id', vehicleId)
    .single()
  return { data, error }
}

export const createVehicle = async (vehicleData) => {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicleData)
    .select()
    .single()
  return { data, error }
}

export const updateVehicle = async (vehicleId, updates) => {
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', vehicleId)
    .select()
    .single()
  return { data, error }
}

export const deleteVehicle = async (vehicleId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ is_active: false })
    .eq('id', vehicleId)
  return { data, error }
}

// ============================================
// SERVICE RECORD HELPERS
// ============================================

export const getServiceRecords = async (vehicleId = null) => {
  let query = supabase
    .from('service_records')
    .select(`
      *,
      vehicle:vehicles(id, year, make, model, owner_id)
    `)
    .order('service_date', { ascending: false })

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId)
  }

  const { data, error } = await query
  return { data, error }
}

export const createServiceRecord = async (recordData) => {
  const { data, error } = await supabase
    .from('service_records')
    .insert(recordData)
    .select()
    .single()
  return { data, error }
}

export const updateServiceRecord = async (recordId, updates) => {
  const { data, error } = await supabase
    .from('service_records')
    .update(updates)
    .eq('id', recordId)
    .select()
    .single()
  return { data, error }
}

export const deleteServiceRecord = async (recordId) => {
  const { error } = await supabase
    .from('service_records')
    .delete()
    .eq('id', recordId)
  return { error }
}

// ============================================
// APPOINTMENT HELPERS
// ============================================

export const getAppointments = async (ownerId = null) => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      vehicle:vehicles(id, year, make, model),
      owner:profiles!owner_id(id, full_name)
    `)
    .order('scheduled_date', { ascending: true })

  if (ownerId) {
    query = query.eq('owner_id', ownerId)
  }

  const { data, error } = await query
  return { data, error }
}

export const createAppointment = async (appointmentData) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()
  return { data, error }
}

export const updateAppointment = async (appointmentId, updates) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single()
  return { data, error }
}

export const deleteAppointment = async (appointmentId) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
  return { error }
}

// ============================================
// DOCUMENT HELPERS
// ============================================

export const getDocuments = async (ownerId = null, vehicleId = null) => {
  let query = supabase
    .from('documents')
    .select(`
      *,
      vehicle:vehicles(id, year, make, model)
    `)
    .order('created_at', { ascending: false })

  if (ownerId) {
    query = query.eq('owner_id', ownerId)
  }
  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId)
  }

  const { data, error } = await query
  return { data, error }
}

export const createDocument = async (documentData) => {
  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single()
  return { data, error }
}

export const deleteDocument = async (documentId) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
  return { error }
}

// ============================================
// CONVERSATION & MESSAGE HELPERS
// ============================================

export const getConversations = async (clientId = null) => {
  let query = supabase
    .from('conversations')
    .select(`
      *,
      client:profiles!client_id(id, full_name, email),
      vehicle:vehicles(id, year, make, model),
      messages(id, content, sender_type, is_read, created_at)
    `)
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  return { data, error }
}

export const getConversation = async (conversationId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      client:profiles!client_id(id, full_name, email),
      vehicle:vehicles(id, year, make, model)
    `)
    .eq('id', conversationId)
    .single()
  return { data, error }
}

export const createConversation = async (clientId, subject = null, vehicleId = null) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      client_id: clientId,
      subject,
      vehicle_id: vehicleId
    })
    .select()
    .single()
  return { data, error }
}

export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(id, full_name)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export const sendMessage = async (conversationId, senderId, senderType, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: senderType,
      content
    })
    .select()
    .single()
  return { data, error }
}

export const markMessagesAsRead = async (conversationId, senderType) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('sender_type', senderType)
    .eq('is_read', false)
  return { error }
}

// ============================================
// STORAGE HELPERS
// ============================================

export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  return { data, error }
}

export const getFileUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const getSignedUrl = async (bucket, path, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  return { data, error }
}

export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const subscribeToMessages = (conversationId, callback) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToConversations = (clientId, callback) => {
  return supabase
    .channel(`conversations:${clientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `client_id=eq.${clientId}`
      },
      callback
    )
    .subscribe()
}

// Unsubscribe helper
export const unsubscribe = (channel) => {
  supabase.removeChannel(channel)
}
