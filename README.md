# 🎬 Plexyfin

A self-hosted media server that combines the best features of **Jellyfin** and **Plex**. Plexyfin provides a beautiful, modern interface for managing and streaming your personal media collection with optional external access via tunneling.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

##  Features

### From Jellyfin
- **100% Open Source** - No proprietary code or paywalls
- **Complete Control** - Host on your own hardware
- **Privacy First** - Your data stays with you
- **No Tracking** - No telemetry or analytics
- **Free Transcoding** - No Plex Pass required

### From Plex
- **Beautiful Interface** - Modern, polished UI/UX
- **Smart Metadata** - Automatic poster, backdrop, and info fetching
- **Continue Watching** - Resume from where you left off
- **Multi-User Support** - Individual accounts and watch history
- **Quality Selection** - Choose streaming quality on-the-fly

### Unique Features
- **Easy Setup** - Automated installation script
- **Docker Support** - Quick deployment with docker-compose
- **External Access** - Built-in Cloudflare Tunnel and ngrok support
- **Modern Stack** - React frontend with Node.js backend
- **Video Transcoding** - Real-time quality adaptation
- **Watch Progress Tracking** - Sync across devices
- **Library Auto-Scan** - Automatically detect new media

## 📋 Requirements

- **Node.js** 18 or higher
- **FFmpeg** (for media processing and transcoding)
- **Operating System**: Linux, macOS, or Windows (with WSL)
- **Storage**: Space for your media files
- **RAM**: Minimum 2GB, 4GB+ recommended
- **CPU**: Multi-core recommended for transcoding

## Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/plexyfin.git
   cd plexyfin
   ```

2. **Run the installation script**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. **Configure your media paths**
   ```bash
   nano .env
   # Edit MEDIA_PATHS to point to your media directories
   # Example: MEDIA_PATHS=/home/user/Movies,/home/user/TV-Shows
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access Plexyfin**
   - Open your browser to `http://localhost:3000`
   - Login with default credentials: `admin` / `admin`
   - **⚠️ IMPORTANT**: Change the password immediately after first login!

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Edit docker-compose.yml**
   ```bash
   # Update the volume paths to point to your media
   nano docker-compose.yml
   ```

2. **Create environment file**
   ```bash
   cp .env.docker .env
   nano .env
   # Set your JWT_SECRET and other configurations
   ```

3. **Start the container**
   ```bash
   docker-compose up -d
   ```

4. **Access Plexyfin**
   - Open `http://localhost:3000`
   - Default login: `admin` / `admin`

### With Cloudflare Tunnel

```bash
# Enable the tunnel profile
docker-compose --profile tunnel up -d
```

## Configuration

### Environment Variables

Edit the `.env` file to configure Plexyfin:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secure-secret-key

# Media Library Paths (comma-separated)
MEDIA_PATHS=/media/movies,/media/tv-shows,/media/music

# FFmpeg Paths
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe

# Metadata (Optional - improves media information)
TMDB_API_KEY=your-tmdb-api-key

# Tunneling for External Access (Optional)
ENABLE_TUNNEL=false
TUNNEL_TYPE=cloudflared  # or 'ngrok'
CLOUDFLARE_TUNNEL_TOKEN=your-token
NGROK_AUTH_TOKEN=your-token
```

### Getting a TMDB API Key

1. Create a free account at [The Movie Database](https://www.themoviedb.org/)
2. Go to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key
4. Add it to your `.env` file as `TMDB_API_KEY`

## Clouflare/Ngrok tunnel Setup

Plexyfin supports two tunneling options to access your server from anywhere:

### Option 1: Cloudflare Tunnel (Recommended)

**Pros**: Free, secure, no open ports, custom domains
**Cons**: Requires Cloudflare account

1. Install cloudflared:
   ```bash
   # Linux/Mac(Intel)
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
   sudo chmod +x /usr/local/bin/cloudflared
   ```

2. Create a tunnel:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create plexyfin
   ```

3. Get your tunnel token and add to `.env`:
   ```env
   ENABLE_TUNNEL=true
   TUNNEL_TYPE=cloudflared
   CLOUDFLARE_TUNNEL_TOKEN=your-token-here
   ```

4. Configure tunnel routing in Cloudflare dashboard

[Detailed Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

### Option 2: ngrok

**Pros**: Quick setup, no configuration
**Cons**: Random URLs on free tier, rate limits

1. Install ngrok:
   ```bash
   # Download from https://ngrok.com/download
   ```

2. Get your auth token from [ngrok dashboard](https://dashboard.ngrok.com/)

3. Add to `.env`:
   ```env
   ENABLE_TUNNEL=true
   TUNNEL_TYPE=ngrok
   NGROK_AUTH_TOKEN=your-token-here
   ```

4. Restart Plexyfin - your public URL will be displayed in logs

## 📚 Usage

### Library Management

1. **Add Media Paths**
   - Configure `MEDIA_PATHS` in `.env`
   - Supports multiple directories separated by commas

2. **Scan Library**
   - Go to Settings → Scan Library
   - Or restart the server (automatic scan on startup)

3. **Supported Formats**
   - **Video**: MP4, MKV, AVI, MOV, WMV, FLV, WebM, M4V
   - **Audio**: MP3, FLAC, WAV, AAC, OGG, M4A

### Streaming Options

- **Direct Play**: Stream original file (best quality, requires compatible format)
- **Transcode**: Real-time conversion to 360p, 480p, 720p, or 1080p

### User Management

- Admin users can create additional accounts
- Each user has independent watch history
- Progress syncs automatically

## 🏗️ Architecture

```
Plexyfin/
├── backend/
│   ├── server.js              # Express server
│   ├── db/
│   │   └── database.js        # SQLite database
│   ├── routes/
│   │   ├── auth.js            # Authentication
│   │   ├── media.js           # Media endpoints
│   │   ├── stream.js          # Streaming endpoints
│   │   ├── library.js         # Library management
│   │   └── user.js            # User management
│   ├── services/
│   │   ├── scanner.js         # Media library scanner
│   │   ├── metadata.js        # TMDB metadata fetcher
│   │   └── tunnel.js          # Tunneling service
│   └── middleware/
│       └── auth.js            # JWT authentication
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # Auth context
│   │   └── api/               # API client
│   └── public/
├── data/                       # SQLite database
├── docker-compose.yml          # Docker deployment
├── Dockerfile                  # Container image
└── install.sh                  # Installation script
```

## 🔧 Development

### Running in Development Mode

```bash
# Backend (with auto-restart)
npm run dev

# Frontend (separate terminal)
npm run client
```

### Building Frontend

```bash
cd frontend
npm run build
```

## 🛠️ Troubleshooting

### FFmpeg not found
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Arch Linux
sudo pacman -S ffmpeg
```

### Port already in use
```bash
# Change PORT in .env file
PORT=3001
```

### Media files not showing
1. Check `MEDIA_PATHS` in `.env`
2. Ensure paths are absolute
3. Verify file permissions
4. Trigger manual scan in Settings

### Transcoding fails
1. Verify FFmpeg installation: `ffmpeg -version`
2. Check `FFMPEG_PATH` in `.env`
3. Ensure sufficient disk space in `/tmp`

## 🔒 Security

- Change default admin password immediately
- Use strong JWT_SECRET (automatically generated by install script)
- Keep Node.js and dependencies updated
- Use HTTPS in production (via reverse proxy or tunnel)
- Regularly backup your database

## 📊 Database

Plexyfin uses SQLite for simplicity and portability. The database is stored in `data/plexyfin.db`.

### Backup
```bash
# Manual backup
cp data/plexyfin.db data/plexyfin.db.backup

# Automated backup (add to crontab)
0 2 * * * cp /path/to/plexyfin/data/plexyfin.db /path/to/backups/plexyfin-$(date +\%Y\%m\%d).db
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Jellyfin** - For inspiration on open-source media servers
- **Plex** - For UI/UX inspiration
- **TMDB** - For metadata API
- **FFmpeg** - For media processing
- **Cloudflare** - For tunneling solution

## 🗺️ Roadmap

- [ ] TV Series episode tracking
- [ ] Mobile apps (iOS/Android)
- [ ] Chromecast support
- [ ] Hardware transcoding acceleration
- [ ] Plugin system
- [ ] Advanced playlist management
- [ ] Subtitle synchronization
- [ ] Multiple audio track selection
- [ ] Live TV and DVR support
- [ ] Music library with artist/album views

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the troubleshooting section

---

**Made with ❤️ for the self-hosting community**

*Enjoy your personal media server!* 🎉
