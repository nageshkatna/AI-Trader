#!/bin/bash
# Setup script for AI Trader Backend

echo "🚀 Setting up AI Trader Backend..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create .env from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

echo "✨ Setup complete!"
echo ""
echo "To start the server:"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "Or:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
