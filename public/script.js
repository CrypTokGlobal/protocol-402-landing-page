
// Enhanced landing page interactions
document.addEventListener('DOMContentLoaded', function() {
  // Initialize smooth scroll and focus management
  initializePageInteractions();
  
  // Enhanced form handling
  initializeFormHandling();
  
  // Performance and accessibility enhancements
  initializeOptimizations();
});

function initializePageInteractions() {
  // Auto-focus name field after animations complete
  setTimeout(() => {
    const nameField = document.querySelector('input[name="name"]');
    if (nameField) {
      nameField.focus();
    }
  }, 1500);

  // Smooth scroll for any internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Enhanced button interactions
  const buttons = document.querySelectorAll('button, .footer-btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', function() {
      if (!this.classList.contains('processing')) {
        this.style.transform = 'translateY(0) scale(1)';
      }
    });
  });
}

function initializeFormHandling() {
  const form = document.getElementById('whitepaperForm');
  const button = form.querySelector('button');
  const originalButtonText = button.textContent;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim()
    };

    // Validation
    if (!data.name || data.name.length < 2) {
      showFormFeedback('Please enter your full name', 'error');
      return;
    }

    if (!isValidEmail(data.email)) {
      showFormFeedback('Please enter a valid email address', 'error');
      return;
    }

    // Set processing state
    button.classList.add('processing');
    button.textContent = '⏳ Processing...';
    button.style.background = 'linear-gradient(135deg, #6c757d, #5a6268)';
    button.disabled = true;

    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Success state
        showFormFeedback('Success! Your download is starting...', 'success');
        
        // Start download
        setTimeout(() => {
          window.open(result.downloadUrl, '_blank');
        }, 500);

        // Success button state
        button.textContent = '✅ Download Started!';
        button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        button.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.4)';

        // Reset form
        setTimeout(() => {
          this.reset();
          resetButton();
          showFormFeedback('Thank you! Check your downloads folder.', 'info', 3000);
        }, 3000);

      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showFormFeedback('Something went wrong. Please try again.', 'error');
      
      button.textContent = '❌ Try Again';
      button.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
      button.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.4)';
      
      setTimeout(resetButton, 4000);
    }

    function resetButton() {
      button.classList.remove('processing');
      button.textContent = originalButtonText;
      button.style.background = 'linear-gradient(135deg, #F5C518, #E6B800)';
      button.style.boxShadow = '0 8px 25px rgba(245, 197, 24, 0.4)';
      button.style.transform = 'translateY(0) scale(1)';
      button.disabled = false;
    }
  });

  // Real-time input validation
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateInput(this);
    });

    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateInput(this);
      }
    });
  });
}

function validateInput(input) {
  const value = input.value.trim();
  
  if (input.name === 'name') {
    if (value.length < 2) {
      setInputError(input, 'Name must be at least 2 characters');
      return false;
    }
  }
  
  if (input.name === 'email') {
    if (!isValidEmail(value)) {
      setInputError(input, 'Please enter a valid email address');
      return false;
    }
  }
  
  setInputSuccess(input);
  return true;
}

function setInputError(input, message) {
  input.classList.add('error');
  input.style.borderColor = '#dc3545';
  input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.2)';
}

function setInputSuccess(input) {
  input.classList.remove('error');
  input.style.borderColor = '#28a745';
  input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.2)';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormFeedback(message, type, duration = 5000) {
  // Remove existing feedback
  const existingFeedback = document.querySelector('.form-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = `form-feedback ${type}`;
  feedback.textContent = message;
  
  // Style feedback
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 300px;
    word-wrap: break-word;
  `;

  // Set background based on type
  const backgrounds = {
    success: 'linear-gradient(135deg, #28a745, #20c997)',
    error: 'linear-gradient(135deg, #dc3545, #c82333)',
    info: 'linear-gradient(135deg, #17a2b8, #138496)'
  };
  feedback.style.background = backgrounds[type] || backgrounds.info;

  document.body.appendChild(feedback);

  // Animate in
  setTimeout(() => {
    feedback.style.opacity = '1';
    feedback.style.transform = 'translateX(0)';
  }, 100);

  // Animate out
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translateX(100px)';
    setTimeout(() => feedback.remove(), 300);
  }, duration);
}

function initializeOptimizations() {
  // Lazy load background image for better performance
  const hero = document.querySelector('.hero');
  if (hero) {
    const img = new Image();
    img.onload = function() {
      hero.style.backgroundImage = hero.style.backgroundImage || 
        `linear-gradient(90deg, rgba(75, 0, 15, 0.1) 0%, rgba(75, 0, 15, 0.3) 45%, rgba(75, 0, 15, 0.95) 100%), url('/lady-justice.png')`;
    };
    img.src = '/lady-justice.png';
  }

  // Preload critical resources
  const preloadLinks = [
    { href: '/lady-justice.png', as: 'image' },
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=DM+Serif+Display&display=swap', as: 'style' }
  ];

  preloadLinks.forEach(link => {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = link.href;
    preloadLink.as = link.as;
    document.head.appendChild(preloadLink);
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, observerOptions);

  // Observe animated elements
  document.querySelectorAll('.card, .features h2').forEach(el => {
    observer.observe(el);
  });

  console.log('🚀 SCETA Protocol 402 - World-class landing page initialized');
}

// Performance monitoring
window.addEventListener('load', function() {
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`⚡ Page loaded in ${loadTime}ms`);
  }
});
