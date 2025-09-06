const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
      }
    });
    res.json({ ip: response.data.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main proxy endpoint for the stream
app.use('/proxy', createProxyMiddleware({
  target: 'https://laaaaaaaal.dupereasy.com',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '/slh/Y29NR1RBV1JTSGc2RGwxN0dZTUdjL1VxdnYwWUVaNjAxME0vRWtCU1E5aFF2VlFnNWFOdERTbnpOdHpheUJzZTNMSjdxZkphcjhWakIrSzJITlBtOEJvZDJRPT0'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add US proxy headers
    proxyReq.setHeader('X-Forwarded-For', '23.95.150.145');
    proxyReq.setHeader('X-Real-IP', '23.95.150.145');
  },
  logLevel: 'debug'
}));

// Direct stream endpoint
app.get('/stream', (req, res) => {
  res.redirect('/proxy/master.m3u8');
});

// Get the master playlist
app.get('/master.m3u8', (req, res) => {
  const proxyUrl = `${req.protocol}://${req.get('host')}/proxy/master.m3u8`;
  res.redirect(proxyUrl);
});

app.listen(PORT, () => {
  console.log(`US Proxy Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Stream URL: http://localhost:${PORT}/stream`);
});
