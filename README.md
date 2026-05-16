# AI Property Agent - Real Estate Lead Management System

A production-ready full-stack application for AI-powered real estate lead management in Kenya, integrating WhatsApp automation with a comprehensive CRM dashboard.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │ -> │     n8n        │ -> │   Backend API   │
│   (CallMeBot)   │    │   Automation   │    │   (Express)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Supabase      │    │   Frontend      │
                       │   PostgreSQL    │    │   (React)       │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### AI-Powered Lead Processing
- WhatsApp message intake via CallMeBot
- AI extraction of location, budget, bedrooms, urgency
- Intelligent lead scoring (Kenyan market optimized)
- Automatic lead categorization (hot/warm/cold)
- Property matching with SQL queries

### Lead Management CRM
- Real-time dashboard with key metrics
- Lead filtering and search capabilities
- Detailed lead profiles with timeline
- Property management (CRUD operations)
- Duplicate lead detection and merging

### Production-Ready Features
- Comprehensive logging and error handling
- Rate limiting and security middleware
- Retry-safe webhook processing
- Data validation and sanitization
- Responsive mobile-first UI

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Supabase** PostgreSQL database
- **Winston** logging
- **Joi** validation
- **CORS** and security middleware

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Headless UI** components

### Infrastructure
- **n8n** for workflow automation
- **Docker** containerization
- **Supabase** cloud database

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase account and project
- n8n instance (provided via Docker)

## 🚀 Quick Start

### 1. Clone and Setup Environment

```bash
git clone <repository-url>
cd ai-property-agent

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Start Infrastructure

```bash
# Start n8n and Supabase connection
docker compose up -d

# Verify n8n is running
curl http://localhost:5678
```

### 3. Setup Backend

```bash
cd backend
npm install
npm run dev
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 5. Access the Application

- **n8n Dashboard**: http://localhost:5678
- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📊 Database Schema

### property_leads
```sql
CREATE TABLE property_leads (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_name TEXT,
  phone TEXT,
  message TEXT,
  location TEXT,
  budget INT,
  bedrooms INT,
  lead_score INT,
  lead_category TEXT, -- 'hot', 'warm', 'cold'
  lead_action TEXT,   -- 'store_and_notify_agent', 'store_and_track', 'store_only'
  urgency TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### properties
```sql
CREATE TABLE properties (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  bedrooms INT NOT NULL,
  price INT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Supabase Configuration
SUPABASE_DB_PASSWORD=your_supabase_password
SUPABASE_PROJECT_REF=your_project_ref
SUPABASE_REGION=eu-central-1

# Backend Configuration
PORT=3001
NODE_ENV=development

# OpenAI (for future AI enhancements)
OPENAI_API_KEY=your_openai_key
```

### n8n Webhook Configuration

Set up your n8n webhook to send POST requests to:
```
http://localhost:3001/api/webhook/lead
```

## 🎯 API Endpoints

### Leads
- `GET /api/leads` - List leads with filtering
- `GET /api/leads/:id` - Get lead details
- `GET /api/leads/stats/summary` - Lead statistics

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Webhooks
- `POST /api/webhook/lead` - Receive n8n lead data
- `GET /api/webhook/test` - Test webhook endpoint

## 🧠 Lead Scoring Logic

Kenyan market-optimized scoring system:

- **Budget**: 200k+ = 30pts, 100k+ = 20pts, 50k+ = 10pts
- **Location Priority**: Kilimani, Westlands, etc. = 15pts
- **Urgency Keywords**: urgent, asap, haraka = 10pts
- **Bedrooms**: 4+ bedrooms = 5pts

**Categories**:
- Hot (60+ points): Immediate agent notification
- Warm (35+ points): Track and follow up
- Cold (<35 points): Store only

## 📱 Frontend Features

### Dashboard
- Real-time metrics and KPIs
- Lead category breakdown
- Recent activity feed
- Quick action buttons

### Leads Management
- Advanced filtering (category, location, date)
- Search functionality
- Lead detail views with timeline
- WhatsApp message history

### Properties Management
- CRUD operations for properties
- Bulk import capabilities
- Location-based filtering
- Price range filtering

## 🔒 Security Features

- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Environment variable protection

## 📝 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests (when implemented)
cd frontend && npm test
```

### Code Quality
```bash
# Lint backend
cd backend && npm run lint

# Lint frontend
cd frontend && npm run lint
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

### Docker Deployment

```yaml
# Add to docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production

  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the logs in `backend/logs/`
- Verify n8n workflow configuration
- Ensure Supabase connection is active
- Check Docker container status

## 🎯 Roadmap

- [ ] Bulk property import via CSV
- [ ] Advanced analytics and reporting
- [ ] WhatsApp message templates
- [ ] Agent assignment system
- [ ] Lead conversion tracking
- [ ] Mobile app companion
- [ ] Multi-language support
- [ ] Integration with property listing APIs
