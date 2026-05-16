#!/bin/bash

# AI Property Agent Setup Script
echo "🚀 Setting up AI Property Agent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your Supabase credentials."
    echo "   Copy .env.example to .env and fill in your values."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🐳 Starting Docker services (n8n)..."
cd ..
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Setup complete!"
echo ""
echo "🌐 Access your services:"
echo "   n8n Dashboard: http://localhost:5678"
echo "   Frontend:      http://localhost:5173 (after starting)"
echo "   Backend API:   http://localhost:3001 (after starting)"
echo ""
echo "🚀 To start development servers:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "📚 Don't forget to:"
echo "   1. Configure your n8n workflows"
echo "   2. Set up WhatsApp webhook URL: http://localhost:3001/api/webhook/lead"
echo "   3. Add properties to your database"
echo ""
echo "🎉 Happy coding!"