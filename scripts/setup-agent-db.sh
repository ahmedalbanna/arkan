#!/bin/bash

# Agent Database Setup Script
# This script sets up the SQLite database for agents

echo "🚀 Setting up Agent Database..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install required dependencies
echo "📦 Installing dependencies..."
npm install sqlite3 better-sqlite3 --save-dev

# Create database directory if it doesn't exist
mkdir -p src/lib/db

# Check if AllAgents.json exists
if [ ! -f "src/lib/AllAgents.json" ]; then
    echo "❌ AllAgents.json not found in src/lib/"
    echo "Please make sure AllAgents.json exists before running this script."
    exit 1
fi

# Run the database setup script
echo "🗄️  Creating database and importing data..."
node src/lib/db/setup-agent-database.js

# Check if database was created successfully
if [ -f "src/lib/db/agents.db" ]; then
    echo "✅ Database setup completed successfully!"
    echo "📁 Database file: src/lib/db/agents.db"
    
    # Show database info
    echo ""
    echo "📊 Database Information:"
    echo "- Tables: agents, agent_commands, agent_capabilities, agent_examples, agent_settings"
    echo "- Views: agents_with_stats, agent_details"
    echo "- API Endpoints: /api/agents, /api/agents/[id], /api/agents/stats"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Start your Next.js development server: npm run dev"
    echo "2. Test the API: http://localhost:3000/api/agents"
    echo "3. Check the Agent Lab: http://localhost:3000/agent-lab"
else
    echo "❌ Database setup failed!"
    exit 1
fi