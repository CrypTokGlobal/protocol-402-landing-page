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
      submitBtn.disabled = false;
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showMessage('Please enter a valid email address.', 'error');
      submitBtn.disabled = false;
      return;
    }

    // Disable submit button and show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Submit to Sheet.best API using fetch with form data (not JSON)
      const response = await fetch('https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9', {
        method: 'POST',
        body: formData // Send form data directly
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
          window.location.href = '/thank-you.html';
        }, 3000);

      } else {
        console.error('❌ Sheet.best API error:', response.status, response.statusText);
        const responseText = await response.text();
        console.error('❌ Response body:', responseText);
        showMessage('There was an error submitting your form. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }

    } catch (error) {
      console.error('Form submission error:', error);
      showMessage('Network error. Please check your connection and try again.', 'error');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }