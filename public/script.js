// Protocol 402 Landing Page - Clean JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - Landing page loaded');

  // Initialize form handling
  initializeFormHandling();
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
      const nameInput = formBox.querySelector('input[name="name"]');
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

function initializeFormHandling() {
  const form = document.getElementById('whitepaperForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();

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

    // Update button state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Submit directly to Sheet.best API
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
        // Show success message
        showSuccessMessage();

        // Reset form
        form.reset();

        // Trigger PDF download with multiple fallback methods
        setTimeout(() => {
          triggerPDFDownload();
        }, 500);

        // Optional: Redirect to thank you page after delay
        setTimeout(() => {
          window.location.href = '/thank-you.html';
        }, 3000);

      } else {
        throw new Error('Submission failed');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      
      // Still allow download even if submission fails
      showSuccessMessage('Download starting (submission may have failed)...');
      setTimeout(() => {
        triggerPDFDownload();
      }, 500);
      
      // Reset form
      form.reset();
    } finally {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

function triggerPDFDownload() {
  const pdfUrl = 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf';
  
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

  // Method 2: Create invisible download link (works on mobile)
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
    console.error('All download methods failed:', error);
    alert('Please click here to download: ' + pdfUrl);
  }
}

function showSuccessMessage(customMessage) {
  // Remove any existing success messages
  const existingMessage = document.querySelector('.success-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create success message
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <span class="checkmark">✅</span>
    ${customMessage || 'Thank you! Download starting shortly...'}
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
      successDiv.remove();
    }, 400);
  }, 4000);
}

// Make scrollToForm globally available
window.scrollToForm = scrollToForm;