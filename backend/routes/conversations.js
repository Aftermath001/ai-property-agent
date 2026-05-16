const express = require('express')
const { supabase } = require('../config/database')
const { authenticate } = require('../middleware/auth')
const { permit } = require('../middleware/rbac')

const router = express.Router()
router.use(authenticate)

router.get('/', permit('chat_with_manager'), async (req, res) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .or(`user_id.eq.${req.user.id},manager_id.eq.${req.user.id}`)
    .order('updated_at', { ascending: false })

  if (error) return res.status(500).json({ error: 'Failed to load conversations' })
  res.json({ conversations: data || [] })
})

router.post('/', permit('chat_with_manager'), async (req, res) => {
  const { lead_id, manager_id, message } = req.body

  try {
    const { data: conversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        lead_id,
        user_id: req.user.id,
        manager_id,
        status: 'active',
        last_message: message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (createError) {
      return res.status(500).json({ error: 'Failed to start conversation' })
    }

    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender: req.user.id,
      channel: 'chat',
      message,
      created_at: new Date().toISOString()
    })

    res.status(201).json({ conversation })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

router.get('/:id/messages', permit('chat_with_manager'), async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: 'Failed to load messages' })
  res.json({ messages: data || [] })
})

router.post('/:id/messages', permit('chat_with_manager'), async (req, res) => {
  const { id } = req.params
  const { message } = req.body

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: id,
      sender: req.user.id,
      channel: 'chat',
      message,
      created_at: new Date().toISOString()
    })
    .select('*')
    .single()

  if (error) return res.status(500).json({ error: 'Failed to send message' })

  await supabase.from('conversations').update({
    last_message: message,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  res.status(201).json({ message: data })
})

module.exports = router
