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
      const name = formData.get('NAME');
      const email = formData.get('EMAIL');
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
        // Create form data for Sheet.best API with correct field names
        const formDataForAPI = new FormData();
        formDataForAPI.append('NAME', name.trim());
        formDataForAPI.append('EMAIL', email.trim());
        formDataForAPI.append('TIMESTAMP', timestamp);

        console.log('📤 Submitting to Sheet.best API with FormData...');
        console.log('📤 FormData contents:', Array.from(formDataForAPI.entries()));
        console.log('📤 Data being sent:', {NAME: name.trim(), EMAIL: email.trim(), TIMESTAMP: timestamp});

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
        
        // Log response details for debugging
        try {
          const responseText = await response.clone().text();
          console.log('📤 Full response body:', responseText);
          
          // Try to parse as JSON for better debugging
          try {
            const responseJson = JSON.parse(responseText);
            console.log('📤 Parsed response JSON:', responseJson);
            
            // Check if the response shows empty fields
            if (Array.isArray(responseJson) && responseJson.length > 0) {
              const firstRecord = responseJson[0];
              if (firstRecord.NAME === "" || firstRecord.EMAIL === "") {
                console.error("❌ API received empty NAME/EMAIL fields!");
                console.error("❌ This suggests a field mapping issue in the FormData");
                console.error("❌ Sent data:", {NAME: name.trim(), EMAIL: email.trim(), TIMESTAMP: timestamp});
                console.error("❌ Received data:", firstRecord);
              }
            }
          } catch (parseError) {
            console.log('📤 Response is not JSON format');
          }
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

  // Production-ready global error handlers
  window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection prevented:', event.reason);
    console.error('❌ Promise:', event.promise);
    console.error('❌ Stack trace:', event.reason?.stack);
    event.preventDefault(); // Prevent the default unhandled rejection behavior
  });

  window.addEventListener('error', function(event) {
    console.error('❌ Global error caught:', event.error);
    console.error('❌ Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
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