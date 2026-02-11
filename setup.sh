#!/bin/bash

echo "🚀 Teleric Learning Path Advisor - Setup Script"
echo "================================================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env and add your OPENROUTER_API_KEY"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if openrouter key is set
if grep -q "your_openrouter_api_key_here" .env; then
    echo "⚠️  WARNING: You need to set your OPENROUTER_API_KEY in .env"
    echo ""
    echo "1. Get your API key from: https://openrouter.ai/keys"
    echo "2. Edit .env and replace 'your_openrouter_api_key_here' with your actual key"
    echo "3. Run this script again: ./setup.sh"
    echo ""
    exit 1
fi

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Setup complete! Services are running:"
    echo ""
    echo "   🌐 Frontend:  http://localhost:3000"
    echo "   🔧 API:       http://localhost:5000"
    echo "   📚 API Docs:  http://localhost:5000/docs"
    echo "   💾 pgAdmin:   http://localhost:5050"
    echo ""
    echo "💡 Tip: View logs with 'docker-compose logs -f'"
    echo "💡 Tip: Stop services with 'docker-compose down'"
else
    echo ""
    echo "⚠️  Some services may have failed to start."
    echo "Check logs with: docker-compose logs"
fi
