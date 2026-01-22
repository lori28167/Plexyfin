# Plexyfin Setup Checklist

Use this checklist to ensure your Plexyfin installation is complete and properly configured.

## ✅ Pre-Installation

- [ ] Node.js 18+ installed
  ```bash
  node --version
  ```

- [ ] npm installed
  ```bash
  npm --version
  ```

- [ ] FFmpeg installed
  ```bash
  ffmpeg -version
  ```

- [ ] Git installed (if cloning)
  ```bash
  git --version
  ```

## ✅ Installation

- [ ] Project downloaded/cloned
  ```bash
  git clone https://github.com/yourusername/plexyfin.git
  cd plexyfin
  ```

- [ ] Installation script executed
  ```bash
  chmod +x install.sh
  ./install.sh
  ```

- [ ] Backend dependencies installed
  ```bash
  # Should be done by install script
  npm install
  ```

- [ ] Frontend dependencies installed
  ```bash
  # Should be done by install script
  cd frontend && npm install
  ```

- [ ] Frontend built
  ```bash
  # Should be done by install script
  npm run build
  ```

## ✅ Configuration

- [ ] `.env` file exists
  ```bash
  ls -la .env
  ```

- [ ] JWT_SECRET is set (should be auto-generated)
  ```bash
  grep JWT_SECRET .env
  ```

- [ ] MEDIA_PATHS configured
  ```bash
  grep MEDIA_PATHS .env
  # Should point to your actual media directories
  ```

- [ ] FFmpeg paths set correctly
  ```bash
  grep FFMPEG_PATH .env
  grep FFPROBE_PATH .env
  ```

- [ ] (Optional) TMDB API key configured
  ```bash
  grep TMDB_API_KEY .env
  ```

## ✅ First Run

- [ ] Server starts without errors
  ```bash
  npm start
  ```

- [ ] Can access web interface
  - Open: http://localhost:3000
  - Should see login page

- [ ] Can login with default credentials
  - Username: admin
  - Password: admin

- [ ] Changed default password
  - Go to Settings
  - Update password
  - CRITICAL SECURITY STEP!

- [ ] Added media paths in Settings
  - Or configured in .env file

- [ ] Triggered library scan
  - Settings → Scan Library
  - Or wait for automatic scan

- [ ] Media appears in library
  - Go to Library tab
  - Should see your media files

## ✅ Features Testing

- [ ] Can browse library
  - All media types show up
  - Posters load (if TMDB configured)

- [ ] Can play video (Direct Play)
  - Click on a video
  - Player loads
  - Video plays

- [ ] Can transcode video
  - Switch quality in player
  - Video adjusts

- [ ] Watch progress saves
  - Play partial video
  - Go back to dashboard
  - "Continue Watching" shows progress

- [ ] Search works
  - Library → Search bar
  - Results appear

## ✅ Optional: External Access

### Using Cloudflare Tunnel

- [ ] cloudflared installed
  ```bash
  cloudflared --version
  ```

- [ ] Cloudflare tunnel created
  ```bash
  cloudflared tunnel list
  ```

- [ ] Token added to .env
  ```bash
  grep CLOUDFLARE_TUNNEL_TOKEN .env
  ```

- [ ] Tunnel enabled in .env
  ```bash
  grep ENABLE_TUNNEL .env
  # Should be: ENABLE_TUNNEL=true
  ```

- [ ] Can access via public URL
  - Check server logs for URL
  - Access from phone/other device

### Using ngrok

- [ ] ngrok installed
  ```bash
  ngrok version
  ```

- [ ] ngrok auth token configured
  ```bash
  grep NGROK_AUTH_TOKEN .env
  ```

- [ ] Can access via ngrok URL
  - Check console output
  - Test from external device

## ✅ Optional: Docker Deployment

- [ ] Docker installed
  ```bash
  docker --version
  ```

- [ ] Docker Compose installed
  ```bash
  docker-compose --version
  ```

- [ ] docker-compose.yml configured
  - Media paths updated
  - Environment variables set

- [ ] Container starts
  ```bash
  docker-compose up -d
  ```

- [ ] Container is running
  ```bash
  docker-compose ps
  ```

- [ ] Can access application
  - http://localhost:3000

- [ ] Logs look good
  ```bash
  docker-compose logs -f
  ```

## ✅ Optional: System Service

- [ ] Service file configured
  - Paths updated
  - Username set

- [ ] Service installed
  ```bash
  sudo systemctl status plexyfin
  ```

- [ ] Service enabled (auto-start)
  ```bash
  sudo systemctl is-enabled plexyfin
  ```

- [ ] Service running
  ```bash
  sudo systemctl is-active plexyfin
  ```

- [ ] Survives reboot
  - Reboot system
  - Check service status

## ✅ Production Readiness

- [ ] Changed admin password
  - CRITICAL!

- [ ] JWT_SECRET is secure and unique
  - Not the default from .env.example

- [ ] Firewall configured (if needed)
  ```bash
  # For UFW
  sudo ufw allow 3000
  
  # For firewalld
  sudo firewall-cmd --permanent --add-port=3000/tcp
  sudo firewall-cmd --reload
  ```

- [ ] Backup strategy in place
  ```bash
  # Backup database
  cp data/plexyfin.db data/plexyfin.db.backup
  ```

- [ ] Logs are being captured
  ```bash
  ls -la logs/
  ```

- [ ] Can access from other devices on network
  - Test from phone/tablet
  - Use server's local IP

## ✅ Documentation Review

- [ ] Read README.md
- [ ] Read QUICKSTART.md
- [ ] Bookmarked docs/TUNNELING.md (if using)
- [ ] Know where to get help
  - GitHub issues
  - Project documentation

## 🎯 Common Issues Checklist

If something isn't working:

- [ ] Check Node.js version (need 18+)
- [ ] Check FFmpeg is in PATH
- [ ] Verify .env file exists and is configured
- [ ] Check file permissions on media directories
- [ ] Look at server logs for errors
- [ ] Verify port 3000 is not in use
- [ ] Check firewall isn't blocking access
- [ ] Media files are in supported formats
- [ ] Paths in .env are absolute paths

## 📊 Performance Checklist

- [ ] Sufficient disk space for media
- [ ] Enough RAM (4GB+ recommended)
- [ ] Multi-core CPU for transcoding
- [ ] Fast storage (SSD recommended)
- [ ] Good network bandwidth
- [ ] Temp directory has space for transcoding

## 🔒 Security Checklist

- [ ] Default password changed
- [ ] JWT_SECRET is strong and unique
- [ ] Using HTTPS (via tunnel or reverse proxy)
- [ ] Firewall properly configured
- [ ] Regular backups enabled
- [ ] Logs monitored for suspicious activity
- [ ] Dependencies kept up to date

---

## ✨ All Done!

If you've checked all the relevant boxes, congratulations! 🎉

Your Plexyfin server is ready to use!

Enjoy your personal media server! 🍿🎬

---

**Need Help?**
- Check [README.md](README.md) for detailed docs
- See [QUICKSTART.md](QUICKSTART.md) for quick reference
- Review [docs/TUNNELING.md](docs/TUNNELING.md) for external access
- Open an issue on GitHub for bugs

**Want to Contribute?**
- See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
