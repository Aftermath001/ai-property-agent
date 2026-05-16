const express = require('express')
const { supabase } = require('../config/database')
const { authenticate } = require('../middleware/auth')
const { permit } = require('../middleware/rbac')

const router = express.Router()

router.use(authenticate)

router.get('/:id/preferences', permit('view_properties'), async (req, res) => {
  const { id } = req.params
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const { data, error } = await supabase
    .from('property_preferences')
    .select('*')
    .eq('user_id', id)
    .single()

  if (error) {
    return res.status(500).json({ error: 'Failed to load preferences' })
  }
  res.json({ preferences: data || {} })
})

router.put('/:id/preferences', permit('save_properties'), async (req, res) => {
  const { id } = req.params
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const preferences = {
    ...req.body,
    user_id: id,
    updated_at: new Date().toISOString()
  }

  const { data: existing } = await supabase
    .from('property_preferences')
    .select('id')
    .eq('user_id', id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('property_preferences')
      .update(preferences)
      .eq('user_id', id)
      .single()

    if (error) return res.status(500).json({ error: 'Failed to update preferences' })
    return res.json({ preferences: data })
  }

  const { data, error } = await supabase
    .from('property_preferences')
    .insert(preferences)
    .select('*')
    .single()

  if (error) return res.status(500).json({ error: 'Failed to save preferences' })
  res.json({ preferences: data })
})

router.get('/:id/saved', permit('save_properties'), async (req, res) => {
  const { id } = req.params
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_id, properties(*)')
    .eq('user_id', id)

  if (error) return res.status(500).json({ error: 'Failed to load saved properties' })
  res.json({ saved: data || [] })
})

module.exports = router
