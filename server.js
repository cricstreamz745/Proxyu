const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Custom logger
const simpleLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
app.use(simpleLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'US Proxy Server is running' });
});

// IP verification endpoint (updated without external proxy)
app.get('/ip-check', async (req, res) => {
  try {
    // Direct IP check without external proxy (since proxy requires auth)
    const response = await axios.get('https://api.ipify.org?format=json');
    res.json({ 
      ip: response.data.ip,
      message: 'Server IP address',
      note: 'External proxy requires authentication'
    });
  } catch (error) {
    console.error('IP check error:', error.message);
    res.status(500).json({ 
      error: 'IP check failed',
      details: error.message 
    });
  }
});

// Configure proxy middleware (direct to target without external proxy)
const proxyOptions = {
  target: 'https://laaaaaaaal.dupereasy.com',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '/slh/Y29NR1RBV1JTSGc2RGwxN0dZTUdjL1VxdnYwWUVaNjAxME0vRWtCU1E5aFF2VlFnNWFOdERTbnpOdHpheUJzZTNMSjdxZkphcjhWakIrSzJITlBtOEJvZDJRPT0'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add headers to simulate US origin
    proxyReq.setHeader('X-Forwarded-For', '72.14.192.0'); // Example US IP range
    proxyReq.setHeader('X-Real-IP', '72.14.192.0');
    proxyReq.setHeader('Via', '1.1 us-proxy-server');
    
    console.log(`Proxying request to: ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ 
      error: 'Proxy error',
      details: err.message 
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response: ${proxyRes.statusCode} ${req.path}`);
    
    // Add CORS headers for web access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  },
  logLevel: 'silent',
  timeout: 30000
};

// Main proxy endpoint
app.use('/proxy', createProxyMiddleware(proxyOptions));

// Direct stream endpoint with proper handling
app.get('/stream', (req, res) => {
  // Set proper headers for HLS stream
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Redirect through our proxy
  res.redirect('/proxy/master.m3u8');
});

app.get('/master.m3u8', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.redirect('/proxy/master.m3u8');
});

// Simple direct proxy endpoint (alternative)
app.get('/direct', (req, res) => {
  res.redirect('https://laaaaaaaal.dupereasy.com/slh/Y29NR1RBV1JTSGc2RGwxN0dZTUdjL1VxdnYwWUVaNjAxME0vRWtCU1E5aFF2VlFnNWFOdERTbnpOdHpheUJzZTNMSjdxZkphcjhWakIrSzJITlBtOEJvZDJRPT0/master.m3u8');
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      '/health',
      '/ip-check',
      '/stream',
      '/master.m3u8',
      '/direct',
      '/proxy/*'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`=== US Proxy Server Started ===`);
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`IP Check: http://localhost:${PORT}/ip-check`);
  console.log(`Stream: http://localhost:${PORT}/stream`);
  console.log(`Direct: http://localhost:${PORT}/direct`);
  console.log(`================================`);
});
