
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Store submissions in memory for now (can be replaced with Google Sheets API)
let submissions = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Create submission object
  const submission = {
    name,
    email,
    timestamp: new Date().toISOString(),
    id: Date.now()
  };
  
  // Store submission (in production, this would go to Google Sheets)
  submissions.push(submission);
  
  // Log to console for debugging
  console.log('New submission:', submission);
  
  // Save to CSV file as backup
  const csvLine = `${submission.timestamp},${submission.name},${submission.email}\n`;
  fs.appendFileSync('submissions.csv', csvLine);
  
  res.json({ 
    success: true, 
    message: 'Thank you! Your download will begin shortly.',
    downloadUrl: '/whitepaper.pdf'
  });
});

// Serve whitepaper (placeholder for now)
app.get('/whitepaper.pdf', (req, res) => {
  // In production, serve actual PDF file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Protocol-402-Whitepaper.pdf"');
  res.send('PDF placeholder - replace with actual whitepaper file');
});

// Admin endpoint to view submissions (remove in production)
app.get('/admin/submissions', (req, res) => {
  res.json(submissions);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SCETA Protocol 402 server running on port ${PORT}`);
  console.log(`📊 Admin submissions view: http://localhost:${PORT}/admin/submissions`);
});
