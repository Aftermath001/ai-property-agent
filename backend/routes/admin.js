const express = require('express')
const { supabase } = require('../config/database')
const { requireRole } = require('../middleware/rbac')

const router = express.Router()

router.get('/metrics', requireRole('admin'), async (req, res) => {
  try {
    const [{ data: userCount }, { data: managerCount }, { data: leadStats }, { data: propertyCount }] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'manager'),
      supabase.from('property_leads').select('id, lead_category, lead_score', { count: 'exact' }),
      supabase.from('properties').select('id', { count: 'exact', head: true })
    ])

    const totalLeads = leadStats ? leadStats.length : 0
    const hotLeads = leadStats ? leadStats.filter((lead) => lead.lead_category === 'hot').length : 0
    const warmLeads = leadStats ? leadStats.filter((lead) => lead.lead_category === 'warm').length : 0
    const coldLeads = leadStats ? leadStats.filter((lead) => lead.lead_category === 'cold').length : 0
    const averageScore = leadStats && leadStats.length > 0 ?
      leadStats.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / leadStats.length : 0

    res.json({
      totalUsers: userCount?.count || 0,
      totalManagers: managerCount?.count || 0,
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      propertyCount: propertyCount?.count || 0,
      averageAILeadScore: Number(averageScore.toFixed(2))
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load admin metrics' })
  }
})

router.get('/workflows', requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflow_logs')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(50)

    if (error) {
      return res.status(500).json({ error: 'Failed to load workflows' })
    }

    res.json({ workflows: data || [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load workflows' })
  }
})

router.get('/permissions', requireRole('admin'), async (req, res) => {
  try {
    const { data: roles } = await supabase.from('roles').select('*')
    res.json({ roles: roles || [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load system roles' })
  }
})

module.exports = router
