const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Supabase configuration
const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF
const supabaseKey = process.env.SUPABASE_DB_PASSWORD

if (!supabaseProjectRef || !supabaseKey) {
  const missing = []
  if (!supabaseProjectRef) missing.push('SUPABASE_PROJECT_REF')
  if (!supabaseKey) missing.push('SUPABASE_DB_PASSWORD')
  throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`)
}

const supabaseUrl = `https://${supabaseProjectRef}.supabase.co`

// Create Supabase client with WebSocket transport for Node.js < 22
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: ws
  }
});

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('property_leads')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};