const express = require('express');
const Joi = require('joi');
const { supabase } = require('../config/database');
const winston = require('winston');

const router = express.Router();

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/webhooks.log' }),
  ],
});

// Validation schema for n8n webhook payload
const webhookLeadSchema = Joi.object({
  customer_name: Joi.string().optional(),
  phone: Joi.string().optional(),
  message: Joi.string().required(),
  location: Joi.string().optional(),
  budget: Joi.number().integer().optional(),
  bedrooms: Joi.number().integer().optional(),
  lead_score: Joi.number().integer().min(0).max(100).optional(),
  lead_category: Joi.string().valid('hot', 'warm', 'cold').optional(),
  lead_action: Joi.string().optional(),
  matched_properties: Joi.array().items(Joi.object()).optional(),
  whatsapp_response: Joi.string().optional(),
  // Additional fields from n8n processing
  urgency: Joi.string().optional(),
  ai_extracted_data: Joi.object().optional(),
});

// POST /api/webhook/lead - Receive enriched lead data from n8n
router.post('/lead', async (req, res) => {
  try {
    logger.info('Received webhook lead payload:', req.body);

    const { error: validationError, value } = webhookLeadSchema.validate(req.body);
    if (validationError) {
      logger.warn('Webhook validation error:', validationError.details[0].message);
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const leadData = {
      ...value,
      created_at: new Date().toISOString()
    };

    // Normalize and sanitize data
    if (leadData.location) {
      leadData.location = leadData.location.trim();
    }

    if (leadData.budget && leadData.budget < 0) {
      leadData.budget = null;
    }

    if (leadData.bedrooms && (leadData.bedrooms < 1 || leadData.bedrooms > 10)) {
      leadData.bedrooms = null;
    }

    // Ensure lead_score and lead_category are set with defaults if missing
    if (!leadData.lead_score) {
      leadData.lead_score = calculateLeadScore(leadData);
    }

    if (!leadData.lead_category) {
      leadData.lead_category = categorizeLead(leadData.lead_score);
    }

    if (!leadData.lead_action) {
      leadData.lead_action = determineLeadAction(leadData.lead_category);
    }

    // Check for duplicate leads (same phone + recent message)
    if (leadData.phone) {
      const { data: existingLeads } = await supabase
        .from('property_leads')
        .select('id, created_at')
        .eq('phone', leadData.phone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingLeads && existingLeads.length > 0) {
        const lastLead = existingLeads[0];
        const lastLeadTime = new Date(lastLead.created_at);
        const now = new Date();
        const hoursDiff = (now - lastLeadTime) / (1000 * 60 * 60);

        // If same phone contacted within 24 hours, update existing lead instead
        if (hoursDiff < 24) {
          logger.info('Updating existing lead due to duplicate detection', {
            existingId: lastLead.id,
            phone: leadData.phone
          });

          const { data: updatedLead, error: updateError } = await supabase
            .from('property_leads')
            .update({
              message: leadData.message,
              location: leadData.location || null,
              budget: leadData.budget || null,
              bedrooms: leadData.bedrooms || null,
              lead_score: leadData.lead_score,
              lead_category: leadData.lead_category,
              lead_action: leadData.lead_action,
              urgency: leadData.urgency || null,
            })
            .eq('id', lastLead.id)
            .select()
            .single();

          if (updateError) {
            logger.error('Error updating duplicate lead:', updateError);
            return res.status(500).json({ error: 'Failed to update lead' });
          }

          return res.json({
            success: true,
            action: 'updated',
            lead: updatedLead
          });
        }
      }
    }

    // Insert new lead
    const { data: newLead, error: insertError } = await supabase
      .from('property_leads')
      .insert(leadData)
      .select()
      .single();

    if (insertError) {
      logger.error('Error inserting lead:', insertError);
      return res.status(500).json({ error: 'Failed to save lead' });
    }

    logger.info('Lead saved successfully:', {
      id: newLead.id,
      category: newLead.lead_category,
      score: newLead.lead_score
    });

    res.json({
      success: true,
      action: 'created',
      lead: newLead
    });

  } catch (err) {
    logger.error('Unexpected error in webhook route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions for lead processing
function calculateLeadScore(lead) {
  let score = 0;

  // Budget scoring (Kenyan market)
  if (lead.budget) {
    if (lead.budget >= 200000) score += 30; // Premium lead
    else if (lead.budget >= 100000) score += 20; // Strong lead
    else if (lead.budget >= 50000) score += 10; // Medium lead
  }

  // Location priority (Nairobi key areas)
  const priorityLocations = ['kilimani', 'westlands', 'lavington', 'kileleshwa', 'karura', ' Muthithi'];
  if (lead.location && priorityLocations.some(loc => lead.location.toLowerCase().includes(loc))) {
    score += 15;
  }

  // Urgency keywords
  const urgencyKeywords = ['urgent', 'asap', 'haraka', 'immediately', 'today', 'now'];
  if (lead.message && urgencyKeywords.some(keyword => lead.message.toLowerCase().includes(keyword))) {
    score += 10;
  }

  // Bedrooms preference (4+ bedroom requests are premium)
  if (lead.bedrooms && lead.bedrooms >= 4) {
    score += 5;
  }

  return Math.min(score, 100);
}

function categorizeLead(score) {
  if (score >= 60) return 'hot';
  if (score >= 35) return 'warm';
  return 'cold';
}

function determineLeadAction(category) {
  switch (category) {
    case 'hot': return 'store_and_notify_agent';
    case 'warm': return 'store_and_track';
    case 'cold': return 'store_only';
    default: return 'store_only';
  }
}

// GET /api/webhook/test - Test endpoint for webhook verification
router.get('/test', (req, res) => {
  res.json({
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    message: 'Send POST requests to /api/webhook/lead, /api/webhook/workflow-log, or /api/webhook/ai-metrics'
  });
});

// Validation schema for workflow log payload
const workflowLogSchema = Joi.object({
  workflow_name: Joi.string().required(),
  status: Joi.string().valid('success', 'failure', 'pending').default('success'),
  payload: Joi.object().optional(),
  error: Joi.object().optional(),
  executed_at: Joi.date().optional(),
});

// POST /api/webhook/workflow-log - Capture n8n workflow execution data
router.post('/workflow-log', async (req, res) => {
  try {
    const { error: validationError, value } = workflowLogSchema.validate(req.body);
    if (validationError) {
      logger.warn('Workflow log validation error:', validationError.details[0].message);
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const logEntry = {
      workflow_name: value.workflow_name,
      status: value.status,
      payload: value.payload || {},
      error: value.error || null,
      executed_at: value.executed_at ? new Date(value.executed_at).toISOString() : new Date().toISOString(),
    };

    const { data, error: insertError } = await supabase
      .from('workflow_logs')
      .insert(logEntry)
      .select()
      .single();

    if (insertError) {
      logger.error('Error saving workflow log:', insertError);
      return res.status(500).json({ error: 'Failed to save workflow log' });
    }

    logger.info('Workflow log saved:', { id: data.id, workflow_name: data.workflow_name });
    res.json({ success: true, log: data });
  } catch (err) {
    logger.error('Unexpected error in workflow-log route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validation schema for AI metrics payload
const aiMetricsSchema = Joi.object({
  request_type: Joi.string().required(),
  success: Joi.boolean().default(true),
  latency_ms: Joi.number().integer().optional(),
  prompt: Joi.string().optional(),
  response: Joi.object().optional(),
  metadata: Joi.object().optional(),
});

// POST /api/webhook/ai-metrics - Capture AI request metrics
router.post('/ai-metrics', async (req, res) => {
  try {
    const { error: validationError, value } = aiMetricsSchema.validate(req.body);
    if (validationError) {
      logger.warn('AI metrics validation error:', validationError.details[0].message);
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const metricEntry = {
      request_type: value.request_type,
      success: value.success,
      latency_ms: value.latency_ms || null,
      prompt: value.prompt || null,
      response: value.response || {},
      metadata: value.metadata || {},
      created_at: new Date().toISOString(),
    };

    const { data, error: insertError } = await supabase
      .from('ai_metrics')
      .insert(metricEntry)
      .select()
      .single();

    if (insertError) {
      logger.error('Error saving AI metrics:', insertError);
      return res.status(500).json({ error: 'Failed to save AI metric' });
    }

    logger.info('AI metrics saved:', { id: data.id, request_type: data.request_type });
    res.json({ success: true, metric: data });
  } catch (err) {
    logger.error('Unexpected error in ai-metrics route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;