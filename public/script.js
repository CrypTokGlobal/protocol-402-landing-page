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
      // Submit to backend
      const response = await fetch('/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success message
        showSuccessMessage();

        // Trigger PDF download
        setTimeout(() => {
          window.open('https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf', '_blank');
        }, 1000);

        // Reset form
        form.reset();

        // Optional: Redirect to thank you page after delay
        setTimeout(() => {
          if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
          }
        }, 3000);

      } else {
        throw new Error(result.error || 'Submission failed');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

function showSuccessMessage() {
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
    Thank you! Download starting shortly...
  `;

  document.body.appendChild(successDiv);

  // Show message with animation
  setTimeout(() => {
    successDiv.classList.add('show');
  }, 100);

  // Hide message after 3 seconds
  setTimeout(() => {
    successDiv.classList.remove('show');
    setTimeout(() => {
      successDiv.remove();
    }, 400);
  }, 3000);
}

// Make scrollToForm globally available
window.scrollToForm = scrollToForm;