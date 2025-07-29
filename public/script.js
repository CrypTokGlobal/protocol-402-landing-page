// SCETA Protocol 402 - Landing Page JavaScript
// Handles form submission to Sheet.best API and PDF download

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - Landing page loaded');

  // Verify logo loading
  const logos = document.querySelectorAll('.partner-logo, .footer-logo');
  logos.forEach(logo => {
    logo.addEventListener('error', function() {
      console.warn(`⚠️ Logo failed to load: ${this.src}`);
      // Hide broken image and show alt text
      this.style.display = 'none';
      const link = this.closest('.logo-link, .footer-logo-link');
      if (link) {
        link.style.fontSize = '14px';
        link.style.color = '#F5C518';
        link.textContent = this.alt;
      }
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

    // Re-enable button function
    function reEnableButton() {
      submitBtn.textContent = 'Submit';
      submitBtn.disabled = false;
    }

    try {
      // Update timestamp before getting form data
      updateTimestamp();

      // Get form data after timestamp is updated
      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const timestamp = formData.get('TIMESTAMP');

      console.log('📋 Form data:', { name, email, timestamp });

      // Enhanced validation with professional feedback
      if (!name || !email || name.trim() === '' || email.trim() === '') {
        showMessage('Please complete all required fields to proceed.', 'error');
        return;
      }

      // Enhanced email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(email.trim())) {
        showMessage('Please provide a valid business email address.', 'error');
        return;
      }

      // Name validation
      if (name.trim().length < 2) {
        showMessage('Please enter your full name.', 'error');
        return;
      }

      // Disable submit button and show loading state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      // Success handler function
      function handleSuccessfulSubmission() {
        console.log('✅ Data logged to Google Sheet successfully');

        // Show professional success message
        showMessage('✅ Thank you! Protocol 402 download initiated. Redirecting to confirmation page...', 'success');

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
        reEnableButton();

        // Show professional success message (user doesn't need to know about backend issues)
        showMessage('✅ Thank you! Protocol 402 download initiated. Redirecting to confirmation page...', 'success');

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

      try {
        // Create FormData for Sheet.best API (they expect FormData, not JSON)
        const formDataForAPI = new FormData();
        formDataForAPI.append('name', name.trim());
        formDataForAPI.append('email', email.trim());
        formDataForAPI.append('TIMESTAMP', timestamp);

        console.log('📤 Submitting to Sheet.best API with FormData...');
        console.log('📤 FormData contents:', [...formDataForAPI.entries()]); // Log FormData contents

        const response = await fetch('https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9', {
          method: 'POST',
          mode: 'cors',
          body: formDataForAPI // Send as FormData, no Content-Type header needed
        });

        console.log('📤 Response status:', response.status);
        console.log('📤 Response ok:', response.ok);
        
        // Log response details for debugging
        try {
          const responseText = await response.clone().text();
          console.log('📤 Response body:', responseText);
        } catch (readError) {
          console.log('📤 Could not read response body:', readError);
        }

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
        console.error("Full error object:", error); // Log the full error object
        handleFallbackSubmission();
      }

    } catch (error) {
      // Final catch for any unhandled errors in the main try block
      console.error('❌ Unhandled form submission error:', error);
      reEnableButton();
      showMessage('❌ An unexpected error occurred. Please try again.', 'error');
    }
  });

  // Update timestamp when page loads
  updateTimestamp();
});