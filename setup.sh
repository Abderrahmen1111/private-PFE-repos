#!/bin/bash

echo "🚀 Setting up Phantom Marketplace..."
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎨 You're all set! Here's what you can do:"
    echo ""
    echo "   npm run dev     - Start development server"
    echo "   npm run build   - Build for production"
    echo "   npm start       - Start production server"
    echo ""
    echo "📖 Visit http://localhost:3000 to see your marketplace"
    echo ""
    echo "💡 Tips:"
    echo "   - Edit components/BackgroundScene.tsx to customize 3D effects"
    echo "   - Modify app/globals.css to change color scheme"
    echo "   - Check IMPLEMENTATION_NOTES.md for detailed documentation"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
