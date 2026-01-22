# Plexyfin Quick Start Guide

## Installation

### Prerequisites
```bash
# Check Node.js version (need 18+)
node --version

# Check if ffmpeg is installed
ffmpeg -version

# Install ffmpeg if needed
# Ubuntu/Debian:
sudo apt update && sudo apt install ffmpeg

# macOS:
brew install ffmpeg
```

### Install Plexyfin
```bash
# Clone and enter directory
git clone https://github.com/yourusername/plexyfin.git
cd plexyfin

# Run installation script
chmod +x install.sh
./install.sh
```

### Configure Media Paths
```bash
# Edit .env file
nano .env

# Set your media directories (example):
MEDIA_PATHS=/home/user/Movies,/home/user/TV-Shows,/home/user/Music
```

### Start Server
```bash
npm start
```

### Access
- URL: `http://localhost:3000`
- Default login: `admin` / `admin`
- **Change password immediately!**

## Docker Quick Start

```bash
# Edit media paths in docker-compose.yml
nano docker-compose.yml

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## External Access with Cloudflare Tunnel

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create plexyfin

# Copy token to .env
nano .env
# Set:
# ENABLE_TUNNEL=true
# TUNNEL_TYPE=cloudflared
# CLOUDFLARE_TUNNEL_TOKEN=your-token

# Restart Plexyfin
npm start
```

## Common Commands

```bash
# Start server
npm start

# Development mode (auto-restart)
npm run dev

# Build frontend
npm run build

# View logs
tail -f logs/plexyfin.log

# Scan library
# Go to Settings → Scan Library in web interface
```

## Troubleshooting

### Can't find media files
1. Check `MEDIA_PATHS` in `.env`
2. Use absolute paths
3. Ensure file permissions are correct
4. Go to Settings and click "Scan Library"

### Streaming doesn't work
1. Verify ffmpeg is installed: `ffmpeg -version`
2. Check `FFMPEG_PATH` in `.env`
3. Try "Direct Play" instead of transcoding

### Port already in use
```bash
# Change port in .env
PORT=3001
```

## Next Steps

1. Add your media files to configured directories
2. Go to Library → Scan Library
3. Get TMDB API key for better metadata (optional)
4. Set up external access via tunnel (optional)
5. Create additional user accounts
6. Enjoy your media! 🎉

For detailed documentation, see [README.md](README.md)
