#!/bin/bash

# Mock Backend Startup Script

echo "Setting up Python Flask Mock Backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
	echo "Creating virtual environment..."
	python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the server
echo "Starting mock backend server..."
echo "Server will be available at http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""
python app.py
