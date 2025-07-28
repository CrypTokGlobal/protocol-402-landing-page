
// Protocol 402 Landing Page - Sheet.best Integration
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - Landing page loaded');
  
  // Initialize form handling
  initializeFormHandling();
  
  // Set timestamp field on page load
  updateTimestamp();
});

function scrollToForm() {
  const formBox = document.querySelector('.form-box');
  if (formBox) {
    formBox.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });

    // Add bounce animation and focus on name input after scroll
    setTimeout(() => {
      formBox.classList.add('bounce-in');
      const nameInput = formBox.querySelector('input[name="NAME"]');
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
    }, 800);

    // Remove bounce class after animation
    setTimeout(() => {
      formBox.classList.remove('bounce-in');
    }, 1400);
  }
}

function updateTimestamp() {
  // Update the hidden timestamp field with current ISO timestamp
  const timestampField = document.getElementById('timestampField');
  if (timestampField) {
    timestampField.value = new Date().toISOString();
  }
}

function initializeFormHandling() {
  const form = document.getElementById('whitepaperForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Get form data
    const formData = new FormData(form);
    const name = formData.get('NAME').trim();
    const email = formData.get('EMAIL').trim();

    // Basic validation
    if (!name || !email) {
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Update timestamp before submission
    updateTimestamp();

    // Update button state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Submit to Sheet.best API using fetch (for better error handling)
      const response = await fetch('https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          NAME: name,
          EMAIL: email,
          TIMESTAMP: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Form submitted successfully to Sheet.best');
        
        // Show success message
        showSuccessMessage('✅ Success! Download starting...');

        // Reset form
        form.reset();

        // Trigger PDF download
        setTimeout(() => {
          triggerPDFDownload();
        }, 500);

        // Redirect to thank you page after 3 seconds
        setTimeout(() => {
          window.location.href = '/thank-you.html';
        }, 3000);

      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('❌ Form submission error:', error);
      
      // Fallback: Still allow download even if submission fails
      showSuccessMessage('⚠️ Download starting (submission may have failed)...');
      setTimeout(() => {
        triggerPDFDownload();
      }, 500);
      
      // Reset form anyway
      form.reset();
      
      // Still redirect after delay
      setTimeout(() => {
        window.location.href = '/thank-you.html';
      }, 3000);
    } finally {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

function triggerPDFDownload() {
  const pdfUrl = 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf';
  
  console.log('🔽 Triggering PDF download...');
  
  // Method 1: Try window.open (works on most browsers)
  try {
    const downloadWindow = window.open(pdfUrl, '_blank');
    
    // If popup was blocked, fallback to other methods
    if (!downloadWindow || downloadWindow.closed || typeof downloadWindow.closed == 'undefined') {
      throw new Error('Popup blocked');
    }
    
    console.log('✅ PDF download triggered via window.open');
    return;
  } catch (error) {
    console.log('Window.open failed, trying alternative methods...');
  }

  // Method 2: Create invisible download link (works on mobile/strict browsers)
  try {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Protocol-402-SCETA-Whitepaper.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Make link invisible
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Trigger click
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
    console.log('✅ PDF download triggered via invisible link');
    return;
  } catch (error) {
    console.log('Download link failed, trying direct navigation...');
  }

  // Method 3: Direct navigation (last resort)
  try {
    window.location.href = pdfUrl;
    console.log('✅ PDF download triggered via direct navigation');
  } catch (error) {
    console.error('❌ All download methods failed:', error);
    alert('Please click here to download: ' + pdfUrl);
  }
}

function showSuccessMessage(customMessage) {
  // Remove any existing success messages
  const existingMessage = document.querySelector('.success-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create success message element
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <span class="checkmark">✅</span>
    ${customMessage || '✅ Thank you! Download starting shortly...'}
  `;

  document.body.appendChild(successDiv);

  // Show message with animation
  setTimeout(() => {
    successDiv.classList.add('show');
  }, 100);

  // Hide message after 4 seconds
  setTimeout(() => {
    successDiv.classList.remove('show');
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 400);
  }, 4000);
}

// Make scrollToForm globally available for onclick handlers
window.scrollToForm = scrollToForm;
