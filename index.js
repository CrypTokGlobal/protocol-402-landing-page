const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com fonts.googleapis.com; img-src 'self' data: blob:; connect-src 'self'; base-uri 'self'; form-action 'self'");
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'An unexpected error occurred. Please try again.' 
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

// No backend form processing - all submissions go directly to Sheet.best API

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/thank-you.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});



// Redirect to actual whitepaper PDF
app.get('/whitepaper.pdf', (req, res) => {
  res.redirect('https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
});

// Admin endpoint to view submissions (remove in production)
app.get('/admin/submissions', (req, res) => {
  res.json({
    message: 'Form submissions now go directly to Sheet.best API',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1lJHdMg7TcefcHEnsgKzXUy-8O-xWsjTf8aWe1KBt7x0',
    localSubmissions: submissions
  });
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