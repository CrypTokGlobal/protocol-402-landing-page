const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// HTTPS redirect middleware for production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Production-ready security headers
app.use((req, res, next) => {
  // Log requests in production for monitoring
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`);
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com fonts.googleapis.com; img-src 'self' data: blob:; connect-src 'self' https://api.sheetbest.com https://sceta.io; base-uri 'self'; form-action 'self' https://api.sheetbest.com");
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Rate limiting store
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW * 2) {
      requestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// Rate limiting middleware
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip);
    }
  }
  
  // Check current client
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, firstRequest: now });
  } else {
    const clientData = requestCounts.get(clientIP);
    if (now - clientData.firstRequest < RATE_LIMIT_WINDOW) {
      clientData.count++;
      if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
    } else {
      requestCounts.set(clientIP, { count: 1, firstRequest: now });
    }
  }
  
  next();
});

// Middleware
app.use(express.json({ limit: '1mb' })); // Reduced limit for security
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public', {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/thank-you.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});



// Redirect to actual whitepaper PDF
app.get('/whitepaper.pdf', (req, res) => {
  try {
    res.redirect('https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
  } catch (error) {
    console.error('PDF redirect error:', error);
    res.status(500).json({ error: 'Unable to access whitepaper. Please try again.' });
  }
});

// Admin endpoint to view submissions (remove in production)
app.get('/admin/submissions', (req, res) => {
  res.json({
    message: 'Form submissions now go directly to Sheet.best API',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1lJHdMg7TcefcHEnsgKzXUy-8O-xWsjTf8aWe1KBt7x0',
    localSubmissions: []
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'An unexpected error occurred. Please try again.' 
  });
});

// Graceful shutdown handling for production
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SCETA Protocol 402 server running on port ${PORT}`);
  console.log(`📊 Admin submissions view: http://localhost:${PORT}/admin/submissions`);
  console.log('');
  console.log('📋 Form Submission Architecture:');
  console.log('   ✅ Frontend submits directly to Sheet.best API');
  console.log('   📊 Spreadsheet: https://docs.google.com/spreadsheets/d/1lJHdMg7TcefcHEnsgKzXUy-8O-xWsjTf8aWe1KBt7x0');
  console.log('   🔗 API Endpoint: https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9');
  console.log('   💡 No backend processing required');
  console.log('');
  console.log(`📈 Sheet.best Integration: ✅ Direct Frontend to API`);
});