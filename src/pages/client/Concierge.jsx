import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  subscribeToMessages,
  markMessagesAsRead,
  unsubscribe
} from '../../lib/supabase'
import { format } from 'date-fns'
import { Send, MessageCircle, AlertCircle } from 'lucide-react'

const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    <div
      className={`max-w-[70%] px-4 py-3 rounded-2xl ${
        isOwn
          ? 'bg-rdc-primary text-white rounded-br-sm'
          : 'bg-rdc-cream text-black rounded-bl-sm'
      }`}
    >
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
      <div className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-rdc-taupe'} text-right`}>
        {format(new Date(message.created_at), 'h:mm a')}
      </div>
    </div>
  </div>
)

const QuickSuggestion = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 text-sm bg-white border border-rdc-warm-gray rounded-full text-rdc-dark-gray hover:bg-rdc-cream transition-colors"
  >
    {text}
  </button>
)

export default function Concierge() {
  const { user, profile } = useAuth()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const suggestions = [
    'Prep the car for Saturday morning',
    'Schedule an oil change',
    'Check tire pressures',
    'What\'s the status of my service?'
  ]

  useEffect(() => {
    loadConversation()
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!conversation) return

    // Subscribe to new messages
    const channel = subscribeToMessages(conversation.id, (payload) => {
      const newMsg = payload.new
      setMessages((prev) => {
        if (prev.find(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    })

    // Mark messages as read
    markMessagesAsRead(conversation.id, 'concierge')

    return () => {
      unsubscribe(channel)
    }
  }, [conversation])

  const loadConversation = async () => {
    try {
      // Get existing conversations
      const { data: conversations, error: convError } = await getConversations(user.id)

      if (convError) throw convError

      let conv = conversations?.[0]

      // Create new conversation if none exists
      if (!conv) {
        const { data: newConv, error: createError } = await createConversation(user.id)
        if (createError) throw createError
        conv = newConv
      }

      setConversation(conv)

      // Load messages
      const { data: msgs, error: msgsError } = await getMessages(conv.id)
      if (msgsError) throw msgsError
      setMessages(msgs || [])
    } catch (err) {
      console.error('Error loading conversation:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const { data, error } = await sendMessage(
        conversation.id,
        user.id,
        'client',
        messageText
      )

      if (error) throw error

      // Message will be added via realtime subscription
    } catch (err) {
      console.error('Error sending message:', err)
      setNewMessage(messageText) // Restore message
      setError('Failed to send message')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="pb-6 border-b border-rdc-warm-gray/40 mb-4">
        <h1 className="page-title">Concierge</h1>
        <p className="text-rdc-taupe mt-1">
          Request car prep, schedule pickups, or ask any question
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl p-4 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <MessageCircle size={48} className="text-rdc-warm-gray mb-4" />
            <h3 className="font-display text-lg font-semibold text-black mb-2">
              Welcome, {profile?.full_name?.split(' ')[0] || 'there'}!
            </h3>
            <p className="text-rdc-taupe max-w-md">
              This is your direct line to the Riding & Driving Club concierge team.
              Send us a message anytime – we're here to help with anything you need.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_type === 'client'}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-rdc-cream rounded-xl p-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-4 py-3 bg-white border border-rdc-warm-gray rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-rdc-primary focus:border-transparent"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 rounded-full bg-rdc-primary text-white flex items-center justify-center hover:bg-rdc-primary-dark transition-colors disabled:opacity-50"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((suggestion) => (
            <QuickSuggestion
              key={suggestion}
              text={suggestion}
              onClick={() => setNewMessage(suggestion)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
