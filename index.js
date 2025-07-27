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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Store submissions in memory for now (can be replaced with Google Sheets API)
let submissions = [];

// Sheet.best API configuration
const SHEET_BEST_URL = process.env.SHEET_BEST_URL || 'https://sheet.best/api/sheets/1lJHdMg7TcefcHEnsgKzXUy-8O-xWsjTf8aWe1KBt7x0';

// Function to save to Google Sheets via Sheet.best
async function saveToGoogleSheets(data) {
    if (!SHEET_BEST_URL) {
        console.log('Sheet.best URL not configured, skipping Google Sheets save');
        return false;
    }

    try {
        const payload = JSON.stringify({
            name: data.name,
            email: data.email,
            timestamp: data.timestamp
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(SHEET_BEST_URL, options, (res) => {
                let responseBody = '';
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log('Successfully saved to Google Sheets via Sheet.best');
                        resolve(true);
                    } else {
                        console.error('Sheet.best API error:', res.statusCode, responseBody);
                        resolve(false);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Sheet.best request error:', error);
                resolve(false);
            });

            req.write(payload);
            req.end();
        });
    } catch (error) {
        console.error('Sheet.best save error:', error);
        return false;
    }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/thank-you.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Create submission object
  const submission = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    timestamp: new Date().toISOString(),
    id: Date.now()
  };

  try {
    // Store submission in memory
    submissions.push(submission);

    // Log to console for debugging
    console.log('New submission:', submission);

    // Save to CSV file as backup (always)
    const csvLine = `${submission.timestamp},${submission.name},${submission.email}\n`;
    fs.appendFileSync('submissions.csv', csvLine);

    // Try to save to Google Sheets (if configured)
    const sheetsSuccess = await saveToGoogleSheets(submission);

    if (sheetsSuccess) {
      console.log('✅ Data saved to both CSV and Google Sheets');
    } else {
      console.log('⚠️ Data saved to CSV only (Google Sheets not configured or failed)');
    }

    res.json({ 
      success: true, 
      message: '✅ Thank you! Download will start shortly.',
      downloadUrl: 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf',
      redirectUrl: '/thank-you.html'
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again.' 
    });
  }
});

// Redirect to actual whitepaper PDF
app.get('/whitepaper.pdf', (req, res) => {
  res.redirect('https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf');
});

// Admin endpoint to view submissions (remove in production)
app.get('/admin/submissions', (req, res) => {
  res.json(submissions);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SCETA Protocol 402 server running on port ${PORT}`);
  console.log(`📊 Admin submissions view: http://localhost:${PORT}/admin/submissions`);
  console.log('');
  console.log('📋 Google Sheets Integration via Sheet.best:');
  console.log('   ✅ Sheet.best API configured and ready');
  console.log('   📊 Spreadsheet: https://docs.google.com/spreadsheets/d/1lJHdMg7TcefcHEnsgKzXUy-8O-xWsjTf8aWe1KBt7x0');
  console.log('   💾 Data saved to both CSV (backup) and Google Sheets');
  console.log('   🔗 API Endpoint: Sheet.best');
  console.log('');
  console.log(`📈 Sheet.best Status: ✅ Active`);
});