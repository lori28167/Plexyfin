# External Access with Tunneling

This guide covers setting up external access to your Plexyfin server using tunneling services.

## Why Use Tunneling?

Tunneling allows you to access your Plexyfin server from anywhere without:
- Opening ports on your router
- Dealing with dynamic IP addresses
- Complex firewall configurations
- Security risks of exposing ports

## Option 1: Cloudflare Tunnel (Recommended)

### Advantages
- ✅ Free forever
- ✅ No open ports required
- ✅ DDoS protection
- ✅ Custom domain support
- ✅ Secure by default (HTTPS)
- ✅ Stable URLs
- ✅ No rate limits

### Setup Steps

#### 1. Install Cloudflared

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Verify installation:**
```bash
cloudflared --version
```

#### 2. Login to Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser where you select your Cloudflare domain.

#### 3. Create a Tunnel

```bash
cloudflared tunnel create plexyfin
```

Save the tunnel ID shown - you'll need it later.

#### 4. Configure the Tunnel

Create a config file:
```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Add this configuration:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOUR_USERNAME/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: plexyfin.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

Replace:
- `YOUR_TUNNEL_ID` with your tunnel ID
- `YOUR_USERNAME` with your username
- `plexyfin.yourdomain.com` with your desired subdomain

#### 5. Create DNS Record

```bash
cloudflared tunnel route dns plexyfin plexyfin.yourdomain.com
```

#### 6. Get Tunnel Token

```bash
cloudflared tunnel token plexyfin
```

Copy the token.

#### 7. Configure Plexyfin

Edit `.env`:
```env
ENABLE_TUNNEL=true
TUNNEL_TYPE=cloudflared
CLOUDFLARE_TUNNEL_TOKEN=your-token-here
```

#### 8. Start Plexyfin

```bash
npm start
```

Your server is now accessible at `https://plexyfin.yourdomain.com`!

### Alternative: Docker with Cloudflare Tunnel

Edit `docker-compose.yml` and uncomment the cloudflared service, then:

```bash
docker-compose --profile tunnel up -d
```

## Option 2: ngrok

### Advantages
- ✅ Very quick setup
- ✅ No configuration needed
- ✅ Great for testing

### Disadvantages
- ❌ Random URLs on free tier
- ❌ URLs expire on free tier
- ❌ Rate limits on free tier
- ❌ Costs for stable URLs

### Setup Steps

#### 1. Install ngrok

Download from [ngrok.com/download](https://ngrok.com/download)

**Linux:**
```bash
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
sudo tar xvzf ngrok-v3-stable-linux-amd64.tgz -C /usr/local/bin
```

**macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

#### 2. Get Auth Token

1. Sign up at [ngrok.com](https://ngrok.com)
2. Go to [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your auth token

#### 3. Configure ngrok

```bash
ngrok config add-authtoken YOUR_TOKEN
```

#### 4. Configure Plexyfin

Edit `.env`:
```env
ENABLE_TUNNEL=true
TUNNEL_TYPE=ngrok
NGROK_AUTH_TOKEN=your-auth-token
```

#### 5. Start Plexyfin

```bash
npm start
```

Look for the ngrok URL in the console output!

### Manual ngrok Usage

You can also run ngrok manually in a separate terminal:

```bash
ngrok http 3000
```

## Option 3: Tailscale (VPN Alternative)

For a VPN-based solution instead of tunneling:

### Advantages
- ✅ Encrypted peer-to-peer connections
- ✅ Works on all your devices
- ✅ No bandwidth limits
- ✅ Very secure

### Setup

1. Install Tailscale on your server and devices:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. Start Tailscale:
   ```bash
   sudo tailscale up
   ```

3. Access Plexyfin using Tailscale IP:
   ```bash
   # Find your Tailscale IP
   tailscale ip -4
   
   # Access: http://100.x.x.x:3000
   ```

4. (Optional) Enable MagicDNS for easy names:
   ```
   # Access: http://your-hostname:3000
   ```

## Security Considerations

### For All Tunneling Methods

1. **Use Strong Passwords**
   - Change default admin password
   - Use unique, complex passwords

2. **Enable HTTPS**
   - Cloudflare provides this automatically
   - ngrok has it built-in

3. **Limit Access**
   - Use Cloudflare Access for additional authentication
   - Consider IP whitelisting if you have static IPs

4. **Monitor Access**
   - Check logs regularly
   - Watch for suspicious activity

5. **Keep Updated**
   - Update Plexyfin regularly
   - Update Node.js and dependencies

### Cloudflare Access (Extra Security Layer)

Add authentication before reaching Plexyfin:

1. Go to Cloudflare Zero Trust dashboard
2. Create an Access application
3. Set authentication rules (email, SSO, etc.)
4. Users must authenticate before accessing

## Comparison Table

| Feature | Cloudflare | ngrok Free | ngrok Paid | Tailscale |
|---------|-----------|------------|------------|-----------|
| Cost | Free | Free | $10+/mo | Free (100 devices) |
| URL Stability | Stable | Random | Custom | IP-based |
| Custom Domain | Yes | No | Yes | No |
| HTTPS | Yes | Yes | Yes | Manual |
| Rate Limits | None | Limited | None | None |
| Setup Difficulty | Medium | Easy | Easy | Easy |
| Best For | Production | Testing | Production | Personal VPN |

## Troubleshooting

### Cloudflare tunnel not connecting

1. Check tunnel status:
   ```bash
   cloudflared tunnel list
   ```

2. Check logs:
   ```bash
   cloudflared tunnel run plexyfin
   ```

3. Verify DNS record exists in Cloudflare dashboard

4. Check credentials file path in config

### ngrok connection issues

1. Verify auth token is correct
2. Check ngrok status:
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

3. View ngrok web interface: `http://localhost:4040`

### Bandwidth issues

If streaming is slow over tunnel:
1. Lower streaming quality in Plexyfin
2. Use direct transcoding instead of direct play
3. Consider Tailscale for better peer-to-peer performance
4. Check your home internet upload speed

## Best Practices

1. **Start with ngrok** for testing
2. **Move to Cloudflare** for production
3. **Use Tailscale** for personal-only access
4. **Always use HTTPS** for external access
5. **Monitor bandwidth** usage
6. **Set up alerts** for unauthorized access
7. **Regular backups** of your configuration

---

For more help, check the [README.md](../README.md) or open an issue on GitHub.
