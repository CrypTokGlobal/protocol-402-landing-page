
// SCETA Protocol 402 - Landing Page JavaScript
// Handles form submission to Sheet.best API and PDF download

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - Landing page loaded');
  
  // Verify logo loading
  const logos = document.querySelectorAll('.header-logo, .footer-logo');
  logos.forEach(logo => {
    logo.addEventListener('error', function() {
      console.warn(`⚠️ Logo failed to load: ${this.src}`);
      // Keep the text label visible even if image fails
      const container = this.closest('.logo-container');
      if (container) {
        const textElements = container.querySelectorAll('.sceta-text, .logo-text-group, .techlaw-content');
        textElements.forEach(el => el.style.display = 'block');
      }
      this.style.display = 'none';
    });
    
    logo.addEventListener('load', function() {
      console.log(`✅ Logo loaded successfully: ${this.alt}`);
    });
  });
  
  const form = document.getElementById('whitepaper-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Function to update timestamp field
  function updateTimestamp() {
    const timestampField = document.getElementById('timestampField');
    const timestamp = new Date().toISOString();
    timestampField.value = timestamp;
    console.log('⏰ Timestamp updated:', timestamp);
  }

  // Function to show success/error messages
  function showMessage(message, type) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      padding: 12px 20px;
      margin: 15px 0;
      border-radius: 8px;
      font-weight: 500;
      text-align: center;
      font-size: 14px;
      ${type === 'success' ? 
        'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
        'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      }
    `;
    
    // Insert message after the form
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
    
    // Auto-remove error messages after 6 seconds
    if (type === 'error') {
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 6000);
    }
  }

  // Function to trigger PDF download
  function downloadPDF() {
    console.log('📄 Starting PDF download...');
    const pdfUrl = 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf';
    
    // Use window.open for reliable cross-browser PDF download
    window.open(pdfUrl, '_blank');
    
    console.log('✅ PDF download triggered via window.open');
  }

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission
    console.log('📝 Form submission initiated');

    // Prevent double submission
    if (submitBtn.disabled) {
      console.log('⚠️ Form already submitting, ignoring duplicate request');
      return;
    }

    // Update timestamp before getting form data
    updateTimestamp();

    // Get form data after timestamp is updated
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const timestamp = formData.get('TIMESTAMP');

    console.log('📋 Form data:', { name, email, timestamp });

    // Basic validation
    if (!name || !email || name.trim() === '' || email.trim() === '') {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Disable submit button and show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Create FormData for Sheet.best API (they expect FormData, not JSON)
      const formDataForAPI = new FormData();
      formDataForAPI.append('name', name.trim());
      formDataForAPI.append('email', email.trim());
      formDataForAPI.append('TIMESTAMP', timestamp);

      console.log('📤 Submitting to Sheet.best API with FormData...');
      const response = await fetch('https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9', {
        method: 'POST',
        mode: 'cors',
        body: formDataForAPI // Send as FormData, no Content-Type header needed
      });

      console.log('📤 Response status:', response.status);
      console.log('📤 Response ok:', response.ok);

      // Handle successful submission or fallback
      if (response.ok || response.status === 200 || response.status === 201) {
        console.log('✅ Form submitted successfully to Sheet.best');
        handleSuccessfulSubmission();
      } else {
        console.warn('⚠️ Sheet.best API error, proceeding with fallback:', response.status, response.statusText);
        handleFallbackSubmission();
      }

    } catch (error) {
      console.warn('⚠️ Network error, proceeding with fallback:', error);
      handleFallbackSubmission();
    }

    // Success handler function
    function handleSuccessfulSubmission() {
      console.log('✅ Data logged to Google Sheet successfully');
      
      // Show success message
      showMessage('✅ Success! Your download will begin shortly and you\'ll be redirected to the thank you page.', 'success');

      // Trigger PDF download immediately
      downloadPDF();

      // Reset form
      form.reset();

      // Redirect to thank you page after 3 seconds
      setTimeout(() => {
        console.log('🔄 Redirecting to thank-you page');
        window.location.href = '/thank-you.html';
      }, 3000);
    }

    // Fallback handler function
    function handleFallbackSubmission() {
      console.log('🔄 Using fallback: PDF download without sheet logging');
      
      // Show success message (user doesn't need to know about backend issues)
      showMessage('✅ Thank you! Your download will begin shortly and you\'ll be redirected to the thank you page.', 'success');

      // Trigger PDF download immediately
      downloadPDF();

      // Reset form
      form.reset();

      // Redirect to thank you page after 3 seconds
      setTimeout(() => {
        console.log('🔄 Redirecting to thank-you page');
        window.location.href = '/thank-you.html';
      }, 3000);
    }
  });

  // Update timestamp when page loads
  updateTimestamp();
});
