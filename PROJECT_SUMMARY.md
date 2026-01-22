# Plexyfin Project Summary

## 🎯 Project Overview

**Plexyfin** is a complete self-hosted media server that combines the best features of Jellyfin (open-source, no paywalls, complete control) with the polished user experience of Plex (beautiful interface, smart metadata, quality selection).

## 📦 What's Included

### Complete Application
✅ **Backend Server** (Node.js/Express)
- Media library management and scanning
- Video streaming with transcoding support
- JWT-based authentication
- SQLite database for user data and watch history
- RESTful API for all operations
- TMDB integration for metadata

✅ **Frontend Interface** (React)
- Modern, responsive UI
- Media browsing and search
- Video player with quality selection
- User management and settings
- Continue watching feature
- Watch progress tracking

✅ **Tunneling Support**
- Cloudflare Tunnel integration
- ngrok support
- Easy external access configuration

✅ **Deployment Options**
- Native installation script
- Docker and Docker Compose
- Systemd service file

### Documentation
📚 Complete documentation set:
- Comprehensive README
- Quick start guide
- Detailed tunneling setup guide
- System service configuration
- Contributing guidelines
- MIT License

## 🏗️ Architecture

```
Backend (Node.js + Express)
├── Authentication & JWT
├── Media Library Scanner
├── Streaming & Transcoding (FFmpeg)
├── Metadata Fetcher (TMDB API)
├── Tunnel Service
└── SQLite Database

Frontend (React)
├── Authentication Context
├── Media Dashboard
├── Library Browser
├── Video Player
├── Settings Panel
└── User Management

External Access
├── Cloudflare Tunnel
└── ngrok
```

## 🚀 Key Features

### From Jellyfin
- 100% open source
- No paywalls or subscriptions
- Complete privacy control
- Free transcoding
- Self-hosted on your hardware

### From Plex
- Beautiful, modern UI
- Smart metadata with posters/backdrops
- Continue watching functionality
- Multi-user support
- Quality selection

### Unique to Plexyfin
- Easy automated installation
- Built-in tunneling support
- Docker-ready deployment
- Modern tech stack (React + Node.js)
- Comprehensive documentation

## 📁 Project Structure

```
Plexyfin/
├── backend/
│   ├── server.js                 # Main server
│   ├── db/
│   │   └── database.js          # SQLite operations
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── media.js             # Media management
│   │   ├── stream.js            # Video streaming
│   │   ├── library.js           # Library scanning
│   │   └── user.js              # User management
│   ├── services/
│   │   ├── scanner.js           # Media scanner
│   │   ├── metadata.js          # TMDB fetcher
│   │   └── tunnel.js            # Tunneling service
│   └── middleware/
│       └── auth.js              # JWT middleware
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   ├── Library.js       # Library browser
│   │   │   ├── Player.js        # Video player
│   │   │   ├── Settings.js      # Settings panel
│   │   │   └── Navbar.js        # Navigation
│   │   ├── context/
│   │   │   └── AuthContext.js   # Auth state
│   │   └── api/
│   │       └── api.js           # API client
│   └── public/
│       └── index.html
│
├── docs/
│   ├── TUNNELING.md             # Tunnel setup guide
│   └── SYSTEMD.md               # Service setup
│
├── Configuration Files
│   ├── .env.example             # Environment template
│   ├── .env.docker              # Docker environment
│   ├── docker-compose.yml       # Docker setup
│   ├── Dockerfile               # Container image
│   └── plexyfin.service         # Systemd service
│
├── Scripts
│   └── install.sh               # Installation script
│
└── Documentation
    ├── README.md                # Main documentation
    ├── QUICKSTART.md            # Quick start guide
    ├── CONTRIBUTING.md          # Contribution guide
    └── LICENSE                  # MIT License
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **Media Processing**: FFmpeg (fluent-ffmpeg)
- **API Client**: Axios
- **Security**: bcryptjs, helmet, CORS

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: styled-components
- **Video Player**: react-player
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Process Manager**: systemd / PM2 compatible
- **Tunneling**: Cloudflare Tunnel, ngrok

## 🎬 How It Works

### 1. Media Library Management
```
User adds media files → Scanner detects files → FFprobe extracts metadata
→ TMDB fetches posters/info → Database stores metadata → UI displays library
```

### 2. Video Streaming
```
User clicks video → Player requests stream → Backend checks authentication
→ Direct play (if compatible) OR Transcode (FFmpeg) → Stream to player
→ Progress tracking updates database
```

### 3. External Access
```
Plexyfin starts → Tunnel service initializes → Cloudflare/ngrok connects
→ Secure public URL generated → Access from anywhere
```

## 📊 Database Schema

### Users Table
- id, username, email, password (hashed), role, created_at

### Media Table
- id, title, type, file_path, duration, codec, resolution
- year, genre, rating, overview
- poster_url, backdrop_url, tmdb_id, imdb_id
- added_at, updated_at

### Watch History Table
- id, user_id, media_id, progress, completed, last_watched

### Sessions Table
- id, user_id, media_id, started_at, device, ip_address

## 🔒 Security Features

- JWT token authentication
- Bcrypt password hashing
- Helmet.js security headers
- CORS protection
- Rate limiting support
- HTTPS via tunneling
- No default credentials (must change on first login)
- Secure random JWT secret generation

## 🌐 Deployment Options

### 1. Native Installation
```bash
./install.sh
npm start
```

### 2. Docker
```bash
docker-compose up -d
```

### 3. System Service
```bash
sudo systemctl enable plexyfin
sudo systemctl start plexyfin
```

## 📈 Performance Considerations

- **Direct Play**: Zero CPU overhead, original quality
- **Transcoding**: CPU-intensive, adjustable quality
- **Database**: SQLite - lightweight, no separate server
- **Caching**: FFmpeg temp directory for transcode cache
- **Concurrent Streams**: Depends on CPU/network

## 🛣️ Future Roadmap

Potential enhancements:
- TV series with episode tracking
- Mobile apps (iOS/Android)
- Chromecast/AirPlay support
- Hardware transcoding (VAAPI, NVENC)
- Plugin system
- Advanced playlist management
- Live TV and DVR
- Multiple audio tracks
- Subtitle synchronization

## 📝 Quick Reference

### Default Credentials
- Username: `admin`
- Password: `admin`
- **⚠️ Change immediately after first login!**

### Default Ports
- Application: `3000`
- ngrok Web Interface: `4040`

### Important Paths
- Database: `data/plexyfin.db`
- Logs: `logs/`
- Config: `.env`
- Transcode temp: `/tmp/plexyfin-transcode`

### Useful Commands
```bash
# Start server
npm start

# Development mode
npm run dev

# Build frontend
cd frontend && npm run build

# Scan library
# Use web interface: Settings → Scan Library

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down

# System service
sudo systemctl status plexyfin
sudo systemctl restart plexyfin
```

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas for contribution:
- New features
- Bug fixes
- Documentation improvements
- Testing
- UI/UX enhancements
- Performance optimizations

## 📧 Support

- GitHub Issues: For bugs and feature requests
- Documentation: Check README.md and docs/
- Community: Welcome to fork and extend!

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

**Built with ❤️ for the self-hosting community**

*This is a complete, production-ready media server!*
