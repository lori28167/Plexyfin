const { spawn } = require('child_process');
const axios = require('axios');

let tunnelProcess = null;
let tunnelUrl = null;

async function initTunnel() {
  const tunnelType = process.env.TUNNEL_TYPE || 'cloudflared';
  
  try {
    if (tunnelType === 'cloudflared') {
      return await initCloudflaredTunnel();
    } else if (tunnelType === 'ngrok') {
      return await initNgrokTunnel();
    } else {
      console.error('Unknown tunnel type:', tunnelType);
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize tunnel:', error);
    return null;
  }
}

async function initCloudflaredTunnel() {
  const token = process.env.CLOUDFLARE_TUNNEL_TOKEN;
  
  if (!token) {
    console.error('CLOUDFLARE_TUNNEL_TOKEN not configured');
    return null;
  }
  
  console.log('Starting Cloudflare Tunnel...');
  
  tunnelProcess = spawn('cloudflared', [
    'tunnel',
    '--no-autoupdate',
    'run',
    '--token',
    token
  ]);
  
  tunnelProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Cloudflared:', output);
    
    // Extract tunnel URL from output
    const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (urlMatch) {
      tunnelUrl = urlMatch[0];
    }
  });
  
  tunnelProcess.stderr.on('data', (data) => {
    console.error('Cloudflared error:', data.toString());
  });
  
  tunnelProcess.on('close', (code) => {
    console.log(`Cloudflared process exited with code ${code}`);
    tunnelProcess = null;
    tunnelUrl = null;
  });
  
  // Wait a bit for tunnel to establish
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return tunnelUrl;
}

async function initNgrokTunnel() {
  const authToken = process.env.NGROK_AUTH_TOKEN;
  const port = process.env.PORT || 3000;
  
  if (!authToken) {
    console.error('NGROK_AUTH_TOKEN not configured');
    return null;
  }
  
  console.log('Starting ngrok tunnel...');
  
  tunnelProcess = spawn('ngrok', [
    'http',
    port,
    '--authtoken',
    authToken,
    '--log',
    'stdout'
  ]);
  
  tunnelProcess.stdout.on('data', (data) => {
    console.log('ngrok:', data.toString());
  });
  
  tunnelProcess.stderr.on('data', (data) => {
    console.error('ngrok error:', data.toString());
  });
  
  tunnelProcess.on('close', (code) => {
    console.log(`ngrok process exited with code ${code}`);
    tunnelProcess = null;
    tunnelUrl = null;
  });
  
  // Wait for ngrok to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Get tunnel URL from ngrok API
  try {
    const response = await axios.get('http://127.0.0.1:4040/api/tunnels');
    const tunnel = response.data.tunnels.find(t => t.proto === 'https');
    if (tunnel) {
      tunnelUrl = tunnel.public_url;
      return tunnelUrl;
    }
  } catch (error) {
    console.error('Failed to get ngrok tunnel URL:', error.message);
  }
  
  return null;
}

function stopTunnel() {
  if (tunnelProcess) {
    tunnelProcess.kill();
    tunnelProcess = null;
    tunnelUrl = null;
    console.log('Tunnel stopped');
  }
}

function getTunnelUrl() {
  return tunnelUrl;
}

// Cleanup on exit
process.on('SIGINT', () => {
  stopTunnel();
  process.exit();
});

process.on('SIGTERM', () => {
  stopTunnel();
  process.exit();
});

module.exports = {
  initTunnel,
  stopTunnel,
  getTunnelUrl
};
