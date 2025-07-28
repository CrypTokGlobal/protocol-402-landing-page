
// SCETA Protocol 402 - Landing Page JavaScript
// Handles form submission to Sheet.best API and PDF download

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - Landing page loaded');
  
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
      margin: 10px 0;
      border-radius: 8px;
      font-weight: 500;
      text-align: center;
      ${type === 'success' ? 
        'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
        'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      }
    `;
    
    // Insert message after the form
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
    
    // Auto-remove error messages after 5 seconds
    if (type === 'error') {
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 5000);
    }
  }

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission
    console.log('📝 Form submission initiated');

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
      // Submit to Sheet.best API using fetch with FormData (not JSON)
      console.log('📤 Submitting to Sheet.best API...');
      const response = await fetch('https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9', {
        method: 'POST',
        body: formData // Send FormData directly (Sheet.best requirement)
      });

      console.log('📤 Response status:', response.status);
      console.log('📤 Response ok:', response.ok);

      if (response.status === 200 || response.ok) {
        console.log('✅ Form submitted successfully to Sheet.best');

        // Show success message
        showMessage('✅ Form submitted successfully! Your whitepaper download will begin shortly.', 'success');

        // Trigger PDF download
        console.log('✅ PDF download triggered via window.open');
        window.open('https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf', '_blank');

        // Redirect to thank you page after 3 seconds
        setTimeout(() => {
          console.log('🔄 Redirecting to thank-you page');
          window.location.href = '/thank-you.html';
        }, 3000);

      } else {
        console.error('❌ Sheet.best API error:', response.status, response.statusText);
        const responseText = await response.text();
        console.error('❌ Response body:', responseText);
        showMessage('There was an error submitting your form. Please try again.', 'error');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }

    } catch (error) {
      console.error('❌ Form submission error:', error);
      showMessage('Network error. Please check your connection and try again.', 'error');
      
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Update timestamp when page loads
  updateTimestamp();
});
