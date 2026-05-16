-- Core RBAC tables
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY(role_id, permission_id)
);

-- User and preferences
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  phone text UNIQUE,
  password_hash text,
  name text,
  avatar_url text,
  role text DEFAULT 'user',
  permissions jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  preferred_locations jsonb,
  budget_range int[],
  bedrooms int[],
  property_types text[],
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  city text,
  region text,
  price int NOT NULL,
  bedrooms int NOT NULL,
  bathrooms int,
  area int,
  property_type text,
  furnished boolean DEFAULT false,
  status text DEFAULT 'available',
  featured boolean DEFAULT false,
  manager_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Leads and CRM
CREATE TABLE IF NOT EXISTS property_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  property_id uuid REFERENCES properties(id),
  manager_id uuid REFERENCES users(id),
  source text,
  phone text,
  message text,
  location text,
  budget int,
  bedrooms int,
  lead_score int,
  lead_category text,
  urgency text,
  status text DEFAULT 'new',
  lead_action text,
  ai_extracted_data jsonb,
  matched_properties jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES property_leads(id) ON DELETE CASCADE,
  event_type text,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Conversations and messages
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES property_leads(id),
  user_id uuid REFERENCES users(id),
  manager_id uuid REFERENCES users(id),
  status text DEFAULT 'active',
  last_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender text,
  channel text,
  message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Notifications and analytics
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text,
  payload jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  user_id uuid,
  manager_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text,
  status text,
  payload jsonb,
  error jsonb,
  executed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text,
  success boolean,
  latency_ms int,
  prompt text,
  response jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text,
  resource text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
