#!/bin/bash

# Plexyfin Installation Script
# This script installs and configures Plexyfin on your system

set -e

echo "🎬 Plexyfin Installation Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    if [ -f /etc/debian_version ]; then
        DISTRO="debian"
    elif [ -f /etc/redhat-release ]; then
        DISTRO="redhat"
    elif [ -f /etc/arch-release ]; then
        DISTRO="arch"
    else
        DISTRO="unknown"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    DISTRO="macos"
else
    print_error "Unsupported operating system: $OSTYPE"
    exit 1
fi

print_info "Detected OS: $OS ($DISTRO)"
echo ""

# Check for required dependencies
echo "Checking dependencies..."

# Check for Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed ($NODE_VERSION)"
else
    print_error "Node.js is not installed"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

# Check for npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed ($NPM_VERSION)"
else
    print_error "npm is not installed"
    exit 1
fi

# Check for ffmpeg
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n 1)
    print_success "ffmpeg is installed"
else
    print_error "ffmpeg is not installed"
    echo ""
    echo "Please install ffmpeg:"
    if [ "$DISTRO" == "debian" ]; then
        echo "  sudo apt update && sudo apt install ffmpeg"
    elif [ "$DISTRO" == "redhat" ]; then
        echo "  sudo yum install ffmpeg"
    elif [ "$DISTRO" == "arch" ]; then
        echo "  sudo pacman -S ffmpeg"
    elif [ "$DISTRO" == "macos" ]; then
        echo "  brew install ffmpeg"
    fi
    exit 1
fi

echo ""
echo "Installing Plexyfin..."
echo ""

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Build frontend
print_info "Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

cd ..

# Create necessary directories
print_info "Creating directories..."
mkdir -p data
mkdir -p logs
print_success "Directories created"

# Setup environment file
if [ ! -f .env ]; then
    print_info "Setting up environment configuration..."
    cp .env.example .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
        sed -i '' "s|MEDIA_PATHS=.*|MEDIA_PATHS=$HOME/Videos|g" .env
        sed -i '' "s|FFMPEG_PATH=.*|FFMPEG_PATH=$(which ffmpeg)|g" .env
        sed -i '' "s|FFPROBE_PATH=.*|FFPROBE_PATH=$(which ffprobe)|g" .env
    else
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
        sed -i "s|MEDIA_PATHS=.*|MEDIA_PATHS=$HOME/Videos|g" .env
        sed -i "s|FFMPEG_PATH=.*|FFMPEG_PATH=$(which ffmpeg)|g" .env
        sed -i "s|FFPROBE_PATH=.*|FFPROBE_PATH=$(which ffprobe)|g" .env
    fi
    
    print_success "Environment configuration created"
else
    print_info ".env file already exists, skipping"
fi

echo ""
echo "================================"
print_success "Plexyfin installation completed!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Edit the .env file to configure your media paths:"
echo "   nano .env"
echo ""
echo "2. Update MEDIA_PATHS to point to your media directories"
echo "   Example: MEDIA_PATHS=/path/to/movies,/path/to/tv-shows"
echo ""
echo "3. (Optional) Configure TMDB API key for metadata:"
echo "   Get a free API key from https://www.themoviedb.org/settings/api"
echo ""
echo "4. (Optional) Setup tunneling for external access:"
echo "   - For Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/"
echo "   - For ngrok: https://ngrok.com/"
echo ""
echo "5. Start Plexyfin:"
echo "   npm start"
echo ""
echo "6. Access Plexyfin at http://localhost:3000"
echo "   Default credentials: admin / admin"
echo "   ⚠️  IMPORTANT: Change the default password after first login!"
echo ""
echo "For Docker deployment:"
echo "  docker-compose up -d"
echo ""
echo "Enjoy your personal media server! 🎉"
