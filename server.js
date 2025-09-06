const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Custom logger to reduce noise
const simpleLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
app.use(simpleLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'US Proxy Server is running' });
});

// IP verification endpoint (for testing)
app.get('/ip-check', async (req, res) => {
  try {
    const response = await axios.get('https://ipv4.webshare.io/', {
      proxy: {
        host: '23.95.150.145',
        port: 6114,
        protocol: 'http'
      },
      timeout: 10000
    });
    res.json({ 
      ip: response.data.trim(),
      message: 'External proxy connection successful'
    });
  } catch (error) {
    console.error('IP check error:', error.message);
    res.status(500).json({ 
      error: 'Proxy connection failed',
      details: error.message 
    });
  }
});

// Configure proxy middleware with better error handling
const proxyOptions = {
  target: 'https://laaaaaaaal.dupereasy.com',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '/slh/Y29NR1RBV1JTSGc2RGwxN0dZTUdjL1VxdnYwWUVaNjAxME0vRWtCU1E5aFF2VlFnNWFOdERTbnpOdHpheUJzZTNMSjdxZkphcjhWakIrSzJITlBtOEJvZDJRPT0'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add US proxy headers
    proxyReq.setHeader('X-Forwarded-For', '23.95.150.145');
    proxyReq.setHeader('X-Real-IP', '23.95.150.145');
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
  },
  logLevel: 'silent', // Reduce noise by silencing default logs
  timeout: 30000
};

// Main proxy endpoint
app.use('/proxy', createProxyMiddleware(proxyOptions));

// Direct stream endpoints
app.get('/stream', (req, res) => {
  res.redirect('/proxy/master.m3u8');
});

app.get('/master.m3u8', (req, res) => {
  const proxyUrl = `${req.protocol}://${req.get('host')}/proxy/master.m3u8`;
  res.redirect(proxyUrl);
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
  console.log(`================================`);
});
