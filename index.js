const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// HTTPS redirect middleware for production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && 
      req.header('x-forwarded-proto') !== 'https' && 
      req.header('host') && 
      !req.url.includes('/health')) {
    console.log(`🔒 Redirecting to HTTPS: ${req.url}`);
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});

// Production-ready security headers
app.use((req, res, next) => {
  // Log only important requests in production for monitoring
  if (!req.url.includes('.css') && !req.url.includes('.js') && !req.url.includes('.png') && !req.url.includes('.ico') && !req.url.includes('.svg')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`);
  }
  
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

// Developer Note: Optimized periodic cleanup with memory efficiency checks
// Only runs cleanup when needed to reduce CPU overhead
let lastCleanupSize = 0;
setInterval(() => {
  const now = Date.now();
  const currentSize = requestCounts.size;
  
  // Skip cleanup if map is small and hasn't grown much
  if (currentSize < 10 && (currentSize - lastCleanupSize) < 5) {
    return;
  }
  
  const cutoffTime = now - (RATE_LIMIT_WINDOW * 2);
  const beforeSize = currentSize;
  
  // Use more efficient cleanup approach
  const ipsToDelete = [];
  for (const [ip, data] of requestCounts.entries()) {
    if (data.firstRequest < cutoffTime) {
      ipsToDelete.push(ip);
    }
  }
  
  // Batch delete for better performance
  ipsToDelete.forEach(ip => requestCounts.delete(ip));
  
  const cleanedUp = beforeSize - requestCounts.size;
  lastCleanupSize = requestCounts.size;
  
  if (cleanedUp > 0) {
    console.log(`🧹 Rate limit cleanup: removed ${cleanedUp} entries, ${requestCounts.size} IPs tracked`);
  }
}, RATE_LIMIT_WINDOW);

// Rate limiting middleware
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // More efficient cleanup - only clean every 100 requests
  if (Math.random() < 0.01) {
    const cutoffTime = now - RATE_LIMIT_WINDOW;
    for (const [ip, data] of requestCounts.entries()) {
      if (data.firstRequest < cutoffTime) {
        requestCounts.delete(ip);
      }
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

// Error tracking
let errorCount = 0;
let lastError = null;
let submissionAttempts = 0;
let lastSubmissionAttempt = null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    rateLimitedIPs: requestCounts.size,
    errorCount: errorCount,
    lastError: lastError,
    submissionAttempts: submissionAttempts,
    lastSubmissionAttempt: lastSubmissionAttempt,
    memoryUsage: process.memoryUsage()
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/thank-you.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});

// Developer Note: Enhanced backup form processing route
// Mirrors Sheet.best structure (NAME, EMAIL, TIMESTAMP) for API failure fallback
app.post('/submit-form', express.json(), (req, res) => {
  submissionAttempts++;
  lastSubmissionAttempt = new Date().toISOString();
  
  try {
    // Accept both frontend naming conventions
    const name = req.body.name || req.body.NAME;
    const email = req.body.email || req.body.EMAIL;
    const timestamp = req.body.timestamp || req.body.TIMESTAMP || lastSubmissionAttempt;
    
    // Enhanced validation matching frontend requirements
    if (!name || !email || name.trim() === '' || email.trim() === '') {
      return res.status(400).json({ 
        error: 'Name and email are required',
        success: false 
      });
    }

    // Email validation matching frontend
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address',
        success: false 
      });
    }

    // Log submission with Sheet.best compatible format
    const submissionData = {
      NAME: name.trim(),
      EMAIL: email.toLowerCase().trim(),
      TIMESTAMP: timestamp,
      source: 'backup_route'
    };

    console.log('📝 Backup form submission received:', submissionData);
    
    // In production, you could save to database or CSV here
    // For now, just log for admin review
    res.status(200).json({ 
      success: true,
      message: 'Form submitted successfully',
      redirect: '/thank-you.html',
      data: submissionData
    });
    
  } catch (error) {
    errorCount++;
    lastError = {
      message: error.message,
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    };
    console.error('❌ Backup form submission error:', error);
    res.status(500).json({ 
      error: 'Submission failed. Please try again.',
      success: false 
    });
  }
});



// Redirect to actual whitepaper PDF
app.get('/whitepaper.pdf', (req, res) => {
  try {
    console.log(`📄 Whitepaper request from ${req.ip} at ${new Date().toISOString()}`);
    res.redirect(301, 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
  } catch (error) {
    errorCount++;
    lastError = {
      message: error.message,
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    };
    console.error('❌ PDF redirect error:', error);
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
  errorCount++;
  lastError = {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    ip: req.ip
  };
  console.error('❌ Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
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