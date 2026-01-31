import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  unsubscribe
} from '../../lib/supabase'
import { format } from 'date-fns'
import { MessageCircle, Send, User } from 'lucide-react'

export default function AdminMessages() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const messagesEndRef = useRef(null)

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (conversations.length > 0) {
      const conversationId = searchParams.get('conversation')
      if (conversationId) {
        const conv = conversations.find(c => c.id === conversationId)
        if (conv) selectConversation(conv)
      } else if (!selectedConversation) {
        selectConversation(conversations[0])
      }
    }
  }, [conversations, searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!selectedConversation) return

    const channel = subscribeToMessages(selectedConversation.id, (payload) => {
      setMessages(prev => {
        if (prev.find(m => m.id === payload.new.id)) return prev
        return [...prev, payload.new]
      })
      markMessagesAsRead(selectedConversation.id, 'client')
    })

    return () => unsubscribe(channel)
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      const { data } = await getConversations()
      setConversations(data || [])
    } catch (err) {
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectConversation = async (conv) => {
    setSelectedConversation(conv)
    setSearchParams({ conversation: conv.id })

    const { data } = await getMessages(conv.id)
    setMessages(data || [])
    await markMessagesAsRead(conv.id, 'client')

    // Update unread count in conversations list
    setConversations(prev => prev.map(c =>
      c.id === conv.id ? { ...c, messages: c.messages?.map(m => ({ ...m, is_read: true })) } : c
    ))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      await sendMessage(selectedConversation.id, user.id, 'concierge', messageText)
    } catch (err) {
      console.error('Error sending message:', err)
      setNewMessage(messageText)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-forest border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="page-title">Messages</h1>
        <p className="text-rdc-taupe mt-1">Client conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageCircle size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">No conversations yet</h3>
          <p className="text-rdc-taupe">Client messages will appear here</p>
        </div>
      ) : (
        <div className="card h-[calc(100%-6rem)] flex overflow-hidden">
          {/* Conversation List */}
          <div className="w-80 border-r border-rdc-cream overflow-y-auto">
            {conversations.map(conv => {
              const lastMessage = conv.messages?.[conv.messages.length - 1]
              const unreadCount = (conv.messages || []).filter(m => !m.is_read && m.sender_type === 'client').length
              const isSelected = selectedConversation?.id === conv.id

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 text-left border-b border-rdc-cream transition-colors ${
                    isSelected ? 'bg-rdc-primary/10' : 'hover:bg-rdc-cream'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rdc-primary/10 flex items-center justify-center font-semibold text-rdc-primary flex-shrink-0">
                    {conv.client?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-black truncate">{conv.client?.full_name}</span>
                      {unreadCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-rdc-primary text-white text-xs font-semibold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <div className="text-sm text-rdc-taupe truncate">{lastMessage.content}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-rdc-cream flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rdc-primary/10 flex items-center justify-center font-semibold text-rdc-primary">
                    {selectedConversation.client?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-black">{selectedConversation.client?.full_name}</div>
                    <div className="text-sm text-rdc-taupe">{selectedConversation.client?.email}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.map(msg => {
                    const isOwn = msg.sender_type === 'concierge'
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                          isOwn ? 'bg-rdc-forest text-white rounded-br-sm' : 'bg-rdc-cream text-black rounded-bl-sm'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                          <div className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-rdc-taupe'} text-right`}>
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-rdc-cream">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your response..."
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="w-12 h-12 rounded-full bg-rdc-forest text-white flex items-center justify-center hover:bg-rdc-forest/90 disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-rdc-taupe">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
