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
  try {
    const currentSize = requestCounts.size;

    // Skip cleanup if map is small and hasn't grown much
    if (currentSize < 20 && (currentSize - lastCleanupSize) < 10) {
      return;
    }

    const now = Date.now();
    const cutoffTime = now - (RATE_LIMIT_WINDOW * 2);
    const beforeSize = currentSize;

    // Use more efficient cleanup approach
    const ipsToDelete = [];
    for (const [ip, data] of requestCounts.entries()) {
      if (data && typeof data === 'object' && data.firstRequest && data.firstRequest < cutoffTime) {
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
  } catch (error) {
    console.error('❌ Rate limit cleanup error:', error);
  }
}, RATE_LIMIT_WINDOW * 2); // Run cleanup less frequently

// Rate limiting middleware
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();

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

// Serve static files from public/static with proper headers
app.use('/static', express.static(path.join(__dirname, 'public', 'static'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Error tracking
let errorCount = 0;
let lastError = null;
let submissionAttempts = 0;
let lastSubmissionAttempt = null;

// PDF verification endpoint for debugging
app.get('/verify-pdf', (req, res) => {
  const localPdfPath = path.join(__dirname, 'public', 'static', 'pdf', 'Protocol_402_SCETA_Whitepaper.pdf');
  const externalUrl = 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf';
  
  let pdfStatus = {};
  
  try {
    if (fs.existsSync(localPdfPath)) {
      const stats = fs.statSync(localPdfPath);
      pdfStatus = {
        localExists: true,
        sizeBytes: stats.size,
        sizeKB: Math.round(stats.size / 1024),
        sizeMB: Math.round(stats.size / 1024 / 1024 * 100) / 100,
        isEmpty: stats.size === 0,
        isSuspiciouslySmall: stats.size < 100000,
        lastModified: stats.mtime,
        path: localPdfPath
      };
    } else {
      pdfStatus = {
        localExists: false,
        error: 'File does not exist'
      };
    }
  } catch (error) {
    pdfStatus = {
      localExists: false,
      error: error.message
    };
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    pdfStatus: pdfStatus,
    externalFallback: externalUrl,
    recommendation: pdfStatus.isEmpty ? 'CRITICAL: Re-download PDF file' : 
                   pdfStatus.isSuspiciouslySmall ? 'WARNING: Verify PDF integrity' : 
                   'PDF appears valid'
  });
});

// Health check endpoint with PDF verification
app.get('/health', (req, res) => {
  // Check PDF availability
  const localPdfPath = path.join(__dirname, 'public', 'static', 'pdf', 'Protocol_402_SCETA_Whitepaper.pdf');
  const pdfExists = fs.existsSync(localPdfPath);
  let pdfSize = 0;

  if (pdfExists) {
    try {
      const stats = fs.statSync(localPdfPath);
      pdfSize = Math.round(stats.size / 1024); // Size in KB
    } catch (e) {
      console.error('PDF stats error:', e);
    }
  }

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
    memoryUsage: process.memoryUsage(),
    pdf: {
      localExists: pdfExists,
      sizeKB: pdfSize,
      path: localPdfPath,
      fallbackUrl: 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf'
    },
    sheetBest: {
      apiUrl: 'https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1lJHdMg7TcefcHEnsgKzXUy-8O-xWsjTf8aWe1KBt7x0'
    }
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
      source: 'backup_route',
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    console.log('📝 Backup form submission received:', submissionData);
    console.log('📊 User details:', {
      isMobile: req.headers['user-agent']?.includes('Mobile') || false,
      timestamp: new Date().toISOString()
    });

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



// Serve whitepaper PDF with enhanced reliability and tracking
app.get('/whitepaper.pdf', (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceType = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
    
    console.log(`📄 WHITEPAPER DOWNLOAD REQUEST:`);
    console.log(`   IP: ${req.ip}`);
    console.log(`   Time: ${timestamp}`);
    console.log(`   Device: ${deviceType}`);
    console.log(`   User-Agent: ${userAgent}`);

    // Check if local PDF exists first
    const localPdfPath = path.join(__dirname, 'public', 'static', 'pdf', 'Protocol_402_SCETA_Whitepaper.pdf');

    if (fs.existsSync(localPdfPath)) {
      const stats = fs.statSync(localPdfPath);
      const fileSizeKB = Math.round(stats.size / 1024);

      // Check if file is actually valid (not empty)
      if (stats.size === 0) {
        console.error('❌ CRITICAL: PDF file exists but is empty (0KB), redirecting to external URL');
        console.error('❌ TRACKING: Empty PDF file detected - this prevents whitepaper downloads');
        return res.redirect(301, 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
      }

      // Additional validation for minimum expected PDF size (should be at least 100KB for a real PDF)
      if (stats.size < 100000) {
        console.error(`❌ WARNING: PDF file suspiciously small (${Math.round(stats.size / 1024)}KB), may be corrupted`);
        console.error('❌ TRACKING: Potentially corrupted PDF detected');
      }

      console.log(`📄 Serving local PDF file (${fileSizeKB}KB)`);
      console.log(`✅ PDF DOWNLOAD SUCCESS: Local file served to ${req.ip}`);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="Protocol_402_SCETA_Whitepaper.pdf"');
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Stream the file for better performance
      const stream = fs.createReadStream(localPdfPath);
      stream.pipe(res);
      
      // Track successful PDF delivery
      stream.on('end', () => {
        console.log(`📈 TRACKING: PDF download completed successfully for ${req.ip}`);
      });

      stream.on('error', (streamError) => {
        console.error('❌ PDF stream error:', streamError);
        if (!res.headersSent) {
          res.redirect(301, 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
        }
      });

    } else {
      console.log('📄 Local PDF not found, redirecting to external URL');
      console.log(`📈 TRACKING: PDF fallback redirect triggered for ${req.ip}`);
      res.redirect(301, 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
    }
  } catch (error) {
    errorCount++;
    lastError = {
      message: error.message,
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    };
    console.error('❌ PDF serve error:', error);

    // Fallback to external URL even on error
    try {
      res.redirect(301, 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
    } catch (redirectError) {
      res.status(500).json({ 
        error: 'Unable to access whitepaper. Please try again or contact support.',
        fallbackUrl: 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf'
      });
    }
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