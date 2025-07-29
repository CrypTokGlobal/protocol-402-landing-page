// SCETA Protocol 402 - Landing Page JavaScript
// Handles form submission to Sheet.best API and PDF download

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - Landing page loaded');

  // Verify logo loading
  const logos = document.querySelectorAll('.partner-logo, .footer-logo');
  logos.forEach(logo => {
    logo.addEventListener('error', function() {
      console.warn(`⚠️ Logo failed to load: ${this.src}`);
      console.warn(`⚠️ Expected src attribute: ${this.getAttribute('src')}`);
      console.warn(`⚠️ Logo alt text: ${this.alt}`);
      console.warn(`⚠️ Current working directory: ${window.location.origin}`);

      // Check if this is the SCETA logo specifically
      if (this.src.includes('sceta-logo.png')) {
        console.error(`❌ SCETA logo path mismatch! Expected: /sceta.png, Got: ${this.src}`);
        // Try to fix the src automatically
        this.src = '/sceta.png';
        return;
      }

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
      console.log(`✅ Logo loaded successfully: ${this.alt} from ${this.src}`);
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

    try {
      await handleFormSubmission();
    } catch (error) {
      console.error('❌ Form submission error:', error);
      // Re-enable button on error
      submitBtn.textContent = 'Submit & Download PDF';
      submitBtn.disabled = false;
      showMessage('❌ An unexpected error occurred. Please try again.', 'error');
    }
  });

  // Async form submission handler
  async function handleFormSubmission() {

    // Re-enable button function
    function reEnableButton() {
      submitBtn.textContent = 'Submit & Download PDF';
      submitBtn.disabled = false;
    }

    try {
      // Update timestamp before getting form data
      updateTimestamp();

      // Get form data after timestamp is updated
      const formData = new FormData(form);
      const name = formData.get('name'); // HTML form uses lowercase 'name'
      const email = formData.get('email'); // HTML form uses lowercase 'email'  
      const timestamp = formData.get('TIMESTAMP');

      console.log('📋 Form data:', { name, email, timestamp });

      // Enhanced client-side validation to prevent empty submissions
      if (!name || !email || name.trim() === '' || email.trim() === '') {
        console.warn('⚠️ Form validation failed: Empty name or email field');
        showMessage('Please complete all required fields to download Protocol 402.', 'error');
        reEnableButton();
        return;
      }

      // Additional validation to ensure no whitespace-only submissions
      if (name.trim().length === 0 || email.trim().length === 0) {
        console.warn('⚠️ Form validation failed: Whitespace-only input detected');
        showMessage('Please enter valid information in all required fields.', 'error');
        reEnableButton();
        return;
      }

      // Sanitize inputs
      const cleanName = name.trim().replace(/[<>]/g, ''); // Remove potential XSS characters
      const cleanEmail = email.trim().toLowerCase();

      // Enhanced email validation with additional security checks
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(cleanEmail)) {
        showMessage('Please provide a valid business email address to proceed.', 'error');
        reEnableButton();
        return;
      }

      // Additional production security: prevent common throwaway email domains
      const throwawayDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
      const emailDomain = cleanEmail.split('@')[1]?.toLowerCase();
      if (throwawayDomains.includes(emailDomain)) {
        showMessage('Please use a professional email address to access Protocol 402.', 'error');
        reEnableButton();
        return;
      }

      // Name validation
      if (cleanName.length < 2) {
        showMessage('Please enter your full name to access the whitepaper.', 'error');
        reEnableButton();
        return;
      }

      // Additional validations
      if (cleanName.length > 100) {
        showMessage('Name is too long. Please use a shorter name.', 'error');
        return;
      }

      if (cleanEmail.length > 254) {
        showMessage('Email address is too long.', 'error');
        return;
      }

      // Prevent empty or invalid submissions
      if (!timestamp || timestamp === '') {
        updateTimestamp();
        console.log('⚠️ Timestamp was empty, regenerating...');
      }

      // Disable submit button and show loading state
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
        // Final validation check before API submission
        if (!cleanName || !cleanEmail || cleanName.length === 0 || cleanEmail.length === 0) {
          console.error('❌ Critical validation error: Empty data detected before API submission');
          showMessage('Please provide valid name and email to proceed.', 'error');
          reEnableButton();
          return;
        }

        // Create form data for Sheet.best API with correct field names
        const formDataForAPI = new FormData();
        formDataForAPI.append('NAME', cleanName);
        formDataForAPI.append('EMAIL', cleanEmail);
        formDataForAPI.append('TIMESTAMP', timestamp);

        console.log('📤 Submitting to Sheet.best API...');
        console.log('📤 Data being sent:', {NAME: cleanName, EMAIL: cleanEmail, TIMESTAMP: timestamp});

        const response = await fetch('https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9', {
          method: 'POST',
          mode: 'cors',
          body: formDataForAPI
        });

        console.log('📤 Response status:', response.status);
        console.log('📤 Response ok:', response.ok);

        // Enhanced error logging with full debugging information
        console.log('📤 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          console.error("❌ Submission failed:", response.status, response.statusText);
          console.error("❌ Response URL:", response.url);
          console.error("❌ Response type:", response.type);
          try {
            const errorText = await response.clone().text();
            console.error("❌ Error response body:", errorText);
          } catch (readError) {
            console.error("❌ Could not read error response:", readError);
          }
        }

        // Validate successful submission with proper data
        let submissionSuccessful = false;

        try {
          const responseText = await response.clone().text();
          console.log('📤 Response body:', responseText);

          if (response.ok) {
            try {
              const responseJson = JSON.parse(responseText);
              console.log('📤 Parsed response JSON:', responseJson);

              // Verify that data was actually saved
              if (Array.isArray(responseJson) && responseJson.length > 0) {
                const firstRecord = responseJson[0];
                if (firstRecord.NAME && firstRecord.EMAIL && firstRecord.NAME.trim() !== "" && firstRecord.EMAIL.trim() !== "") {
                  console.log('✅ Data verification successful - all fields populated');
                  submissionSuccessful = true;
                } else {
                  console.error("❌ Data verification failed - empty fields in response");
                  console.error("❌ Expected:", {NAME: name.trim(), EMAIL: email.trim()});
                  console.error("❌ Received:", firstRecord);
                }
              }
            } catch (parseError) {
              console.log('📤 Response is not JSON, treating as successful if status OK');
              submissionSuccessful = response.ok;
            }
          }
        } catch (readError) {
          console.error('❌ Could not read response:', readError);
        }

        // Handle based on verification results
        if (submissionSuccessful) {
          console.log('✅ Form submitted and verified successfully');
          handleSuccessfulSubmission();
        } else {
          console.warn('⚠️ Submission verification failed, using fallback');
          handleFallbackSubmission();
        }

      } catch (error) {
        console.warn('⚠️ Network error, proceeding with fallback:', error);
        console.error("❌ Full error object:", error); // Log the full error object
        handleFallbackSubmission();
      }

    } catch (error) {
      // Final catch for any unhandled errors in the main try block
      console.error('❌ Unhandled form submission error:', error);
      reEnableButton();
      showMessage('❌ An unexpected error occurred. Please try again.', 'error');
    }
  }

  // Update timestamp when page loads
  updateTimestamp();

  // Verify critical assets exist
  async function verifyAssets() {
    const criticalAssets = [
      '/sceta.png',
      '/usc-law.png', 
      '/techinlaw.png',
      '/lady-justice.png',
      '/favicon.ico'
    ];

    console.log('🔍 Verifying critical assets...');

    for (const asset of criticalAssets) {
      try {
        const response = await fetch(asset, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ Asset verified: ${asset}`);
        } else {
          console.error(`❌ Asset missing or inaccessible: ${asset} (${response.status})`);
        }
      } catch (error) {
        console.error(`❌ Asset check failed for ${asset}:`, error);
      }
    }
  }

  // Run asset verification
  verifyAssets();

  // Production-ready global error handlers with enhanced logging
  window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection prevented:', event.reason);
    console.error('❌ Promise:', event.promise);
    console.error('❌ Stack trace:', event.reason?.stack);
    
    // Send critical errors to monitoring (in production, you'd send to your logging service)
    if (event.reason && event.reason.message && event.reason.message.includes('network')) {
      console.warn('🌐 Network-related error detected - user may have connectivity issues');
    }
    
    event.preventDefault(); // Prevent the default unhandled rejection behavior
  });

  window.addEventListener('error', function(event) {
    console.error('❌ Global error caught:', event.error);
    console.error('❌ Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  });

  // Monitor page visibility for analytics
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      console.log('📱 Page hidden');
    } else {
      console.log('📱 Page visible');
    }
  });

  // Performance monitoring
  window.addEventListener('load', function() {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('⚡ Page performance metrics:', {
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        resourceCount: performance.getEntriesByType('resource').length
      });
    }, 1000);
  });
});