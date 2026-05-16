const express = require('express')
const { supabase } = require('../config/database')
const { authenticate } = require('../middleware/auth')
const { permit } = require('../middleware/rbac')

const router = express.Router()
router.use(authenticate)

router.get('/', permit('view_properties'), async (req, res) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return res.status(500).json({ error: 'Failed to load notifications' })
  res.json({ notifications: data || [] })
})

router.post('/read/:id', permit('view_properties'), async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select('*')
    .single()

  if (error) return res.status(500).json({ error: 'Failed to mark notification' })
  res.json({ notification: data })
})

module.exports = router
