# Running Plexyfin as a System Service

This guide explains how to run Plexyfin as a systemd service on Linux, so it starts automatically on boot and runs in the background.

## Installation

1. **Edit the service file**
   ```bash
   nano plexyfin.service
   ```

   Update the following:
   - `YOUR_USERNAME` → your Linux username
   - `/path/to/plexyfin` → full path to Plexyfin directory
   - `/path/to/your/media` → your media directory paths

2. **Copy to systemd directory**
   ```bash
   sudo cp plexyfin.service /etc/systemd/system/
   ```

3. **Create log directory**
   ```bash
   mkdir -p logs
   ```

4. **Reload systemd**
   ```bash
   sudo systemctl daemon-reload
   ```

5. **Enable service (start on boot)**
   ```bash
   sudo systemctl enable plexyfin
   ```

6. **Start the service**
   ```bash
   sudo systemctl start plexyfin
   ```

## Managing the Service

### Check status
```bash
sudo systemctl status plexyfin
```

### View logs
```bash
# Real-time logs
sudo journalctl -u plexyfin -f

# Recent logs
sudo journalctl -u plexyfin -n 100

# Application logs
tail -f logs/plexyfin.log
tail -f logs/plexyfin-error.log
```

### Stop service
```bash
sudo systemctl stop plexyfin
```

### Restart service
```bash
sudo systemctl restart plexyfin
```

### Disable auto-start
```bash
sudo systemctl disable plexyfin
```

## Updating Plexyfin

When you update the code:

```bash
# Stop service
sudo systemctl stop plexyfin

# Pull updates
git pull

# Install dependencies
npm install
cd frontend && npm install && npm run build
cd ..

# Start service
sudo systemctl start plexyfin
```

## Troubleshooting

### Service fails to start

Check the logs:
```bash
sudo journalctl -u plexyfin -n 50
```

Common issues:
- Wrong paths in service file
- Missing Node.js in PATH
- Permission issues (check file ownership)
- Port already in use

### Permission errors

Ensure proper ownership:
```bash
sudo chown -R YOUR_USERNAME:YOUR_USERNAME /path/to/plexyfin
```

### Can't access from other devices

Check firewall:
```bash
# Allow port 3000
sudo ufw allow 3000
# Or for firewalld
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## Alternative: Using PM2

If you prefer PM2 instead of systemd:

```bash
# Install PM2
npm install -g pm2

# Start Plexyfin
pm2 start backend/server.js --name plexyfin

# Save configuration
pm2 save

# Setup startup script
pm2 startup
# Follow the instructions shown

# Manage
pm2 list
pm2 logs plexyfin
pm2 restart plexyfin
pm2 stop plexyfin
```

PM2 provides:
- Automatic restarts on crashes
- Log management
- Monitoring
- Cluster mode support
