# AI Property Agent Backend

Node.js Express API for the AI Property Agent Lead Management System.

## Features

- RESTful API for leads and properties management
- Supabase PostgreSQL integration
- Webhook endpoint for n8n integration
- Lead scoring and categorization
- Duplicate lead detection
- Comprehensive logging
- Rate limiting and security middleware

## Installation

```bash
cd backend
npm install
```

## Environment Variables

The backend uses the same `.env` file from the project root. Make sure the following variables are set:

- `SUPABASE_DB_PASSWORD` - Your Supabase database password
- `SUPABASE_PROJECT_REF` - Your Supabase project reference
- `SUPABASE_REGION` - Your Supabase region (default: eu-central-1)

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Leads
- `GET /api/leads` - Fetch all leads with filtering
- `GET /api/leads/:id` - Get lead details with matched properties
- `GET /api/leads/stats/summary` - Get lead statistics

### Properties
- `GET /api/properties` - List properties with filtering
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Webhooks
- `POST /api/webhook/lead` - Receive enriched lead data from n8n
- `GET /api/webhook/test` - Test webhook endpoint

### Health Check
- `GET /health` - Server health check

## Webhook Integration

The `/api/webhook/lead` endpoint receives data from n8n workflows and:

1. Validates the payload
2. Normalizes AI-extracted data
3. Calculates lead scores if missing
4. Detects and handles duplicate leads
5. Stores structured lead data in Supabase

### Expected Payload Format

```json
{
  "customer_name": "John Doe",
  "phone": "+254712345678",
  "message": "I need a 4 bedroom house in Westlands under 250k",
  "location": "Westlands",
  "budget": 250000,
  "bedrooms": 4,
  "urgency": "urgent",
  "matched_properties": [...],
  "whatsapp_response": "Found 3 properties matching your criteria..."
}
```

## Lead Scoring Logic

The system implements Kenyan market-specific scoring:

- **Budget**: 200k+ = 30 points, 100k+ = 20 points, 50k+ = 10 points
- **Location Priority**: Kilimani, Westlands, etc. = 15 points
- **Urgency Keywords**: urgent, asap, haraka = 10 points
- **Bedrooms**: 4+ bedrooms = 5 points

**Categories**:
- Hot: 60+ points
- Warm: 35+ points
- Cold: < 35 points

## Database Schema

### property_leads
- id (bigint, auto increment)
- customer_name (text)
- phone (text)
- message (text)
- location (text)
- budget (int)
- bedrooms (int)
- lead_score (int)
- lead_category (text)
- lead_action (text)
- urgency (text)
- created_at (timestamp)

### properties
- id (bigint, auto increment)
- title (text)
- location (text)
- bedrooms (int)
- price (int)
- description (text)
- created_at (timestamp)

## Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error messages
- `combined.log` - All log messages
- `leads.log` - Lead-related operations
- `properties.log` - Property-related operations
- `webhooks.log` - Webhook operations

## Testing

```bash
npm test
```

## Deployment

The backend is designed to work with the existing n8n Docker setup. Add it to your `docker-compose.yml`:

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - n8n
```