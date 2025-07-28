
// Enhanced landing page with world-class animations and interactions
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - World-class landing page initialized');
  
  // Initialize page load animation
  initializePageLoad();
  
  // Initialize smooth scroll and focus management
  initializePageInteractions();
  
  // Enhanced form handling with success animation
  initializeFormHandling();
  
  // Performance and accessibility enhancements
  initializeOptimizations();
  
  // Initialize scroll-to-top
  initializeScrollToTop();
});

function initializePageLoad() {
  // Add smooth page load effect
  document.body.classList.add('loaded');
  
  // Remove loading class after a brief delay to trigger animations
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 100);
  
  // Track conversion for analytics (only once)
  if (!window.pageLoadTracked) {
    console.log('Conversion tracked:', {
      name: 'Page Load',
      email: 'analytics@sceta.io'
    });
    window.pageLoadTracked = true;
  }
}

function initializePageInteractions() {
  // Auto-focus name field after animations complete
  setTimeout(() => {
    const nameField = document.querySelector('input[name="name"]');
    if (nameField) {
      nameField.focus();
    }
  }, 2000);

  // Smooth scroll for download anchor
  const scrollToFormLink = document.querySelector('.scroll-to-form');
  if (scrollToFormLink) {
    scrollToFormLink.addEventListener('click', function(e) {
      e.preventDefault();
      const formBox = document.querySelector('.form-box');
      if (formBox) {
        formBox.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Add focus highlight after scroll
        setTimeout(() => {
          formBox.style.boxShadow = '0 0 0 3px rgba(245, 197, 24, 0.5), 0 25px 80px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 40px rgba(245, 197, 24, 0.3)';
          setTimeout(() => {
            formBox.style.boxShadow = '0 0 0 1px rgba(245, 197, 24, 0.2), 0 25px 80px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 40px rgba(245, 197, 24, 0.1)';
          }, 2000);
        }, 500);
      }
    });
  }

  // Enhanced button interactions with cursor effects
  const buttons = document.querySelectorAll('button, .footer-btn, .scroll-to-form');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.cursor = 'pointer';
      if (!this.classList.contains('processing')) {
        this.style.transform = this.style.transform || 'translateY(0) scale(1)';
        if (this.classList.contains('scroll-to-form')) {
          this.style.transform = 'translateY(-2px) rotate(-1deg)';
        } else {
          this.style.transform = 'translateY(-3px) scale(1.02) rotate(-1deg)';
        }
      }
    });
    
    button.addEventListener('mouseleave', function() {
      if (!this.classList.contains('processing')) {
        this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
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

    // Enhanced validation
    if (!data.name || data.name.length < 2) {
      showFormFeedback('Please enter your full name', 'error');
      return;
    }

    if (!isValidEmail(data.email)) {
      showFormFeedback('Please enter a valid email address', 'error');
      return;
    }

    // Set enhanced processing state
    button.classList.add('processing');
    button.textContent = '⏳ Processing...';
    button.style.background = 'linear-gradient(135deg, #6c757d, #5a6268)';
    button.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.4)';
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
        // Show enhanced success animation
        showSuccessMessage();
        
        // Success button state with enhanced styling
        button.textContent = '🎉 Download Started!';
        button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        button.style.boxShadow = '0 0 30px rgba(40, 167, 69, 0.6), 0 0 12px #28a745';
        
        // Start download immediately
        setTimeout(() => {
          window.open(result.downloadUrl, '_blank');
        }, 800);

        // Redirect to thank you page after successful download
        setTimeout(() => {
          window.location.href = result.redirectUrl || '/thank-you.html';
        }, 2000);

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
      button.style.boxShadow = '0 8px 25px rgba(245, 197, 24, 0.4), 0 0 0 1px rgba(245, 197, 24, 0.2)';
      button.style.transform = 'translateY(0) scale(1) rotate(0deg)';
      button.disabled = false;
    }
  });

  // Real-time input validation with enhanced UX
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

    // Add focus effects
    input.addEventListener('focus', function() {
      this.style.transform = 'translateY(-1px)';
    });

    input.addEventListener('blur', function() {
      if (!this.classList.contains('error')) {
        this.style.transform = 'translateY(0)';
      }
    });
  });
}

function showSuccessMessage() {
  // Create enhanced success modal
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <span class="checkmark">🎉</span>
    <div>Thank You!</div>
    <div style="font-size: 1rem; font-weight: 400; margin-top: 0.5rem;">Your download will begin shortly...</div>
  `;
  
  document.body.appendChild(successDiv);
  
  // Animate in
  setTimeout(() => {
    successDiv.classList.add('show');
  }, 100);
  
  // Animate out
  setTimeout(() => {
    successDiv.classList.remove('show');
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 400);
  }, 3000);
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
  input.style.transform = 'translateY(1px)';
}

function setInputSuccess(input) {
  input.classList.remove('error');
  input.style.borderColor = '#28a745';
  input.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.2)';
  input.style.transform = 'translateY(0)';
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

  // Create enhanced feedback element
  const feedback = document.createElement('div');
  feedback.className = `form-feedback ${type}`;
  feedback.textContent = message;
  
  // Enhanced styling
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1.2rem 1.8rem;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 350px;
    word-wrap: break-word;
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 400);
  }, duration);
}

function initializeScrollToTop() {
  // Create scroll-to-top button
  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.className = 'scroll-to-top';
  scrollToTopBtn.innerHTML = '↑';
  scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(scrollToTopBtn);

  // Show/hide based on scroll position
  let scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 50) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }, 10);
  });

  // Smooth scroll to top
  scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

function initializeOptimizations() {
  // Enhanced lazy loading for Lady Justice image
  const hero = document.querySelector('.hero');
  if (hero && !window.heroImageLoaded) {
    const img = new Image();
    img.onload = function() {
      console.log('Lady Justice image loaded successfully');
      hero.style.backgroundImage = hero.style.backgroundImage || 
        `linear-gradient(90deg, rgba(75, 0, 15, 0.1) 0%, rgba(75, 0, 15, 0.3) 45%, rgba(75, 0, 15, 0.95) 100%), url('/lady-justice.png')`;
      window.heroImageLoaded = true;
    };
    img.onerror = function() {
      console.warn('Lady Justice image failed to load, using fallback');
      hero.style.background = 'linear-gradient(135deg, #4b000f 0%, #2a0008 100%)';
      window.heroImageLoaded = true;
    };
    img.src = '/lady-justice.png';
  }

  // Enhanced intersection observer for scroll animations
  if (!window.observerInitialized) {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe animated elements with enhanced effects
    document.querySelectorAll('.card, .features h2, .form-box').forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
      observer.observe(el);
    });

    window.observerInitialized = true;
    console.log('🚀 SCETA Protocol 402 landing page fully loaded');
  }
}

// Enhanced performance monitoring
window.addEventListener('load', function() {
  if ('performance' in window && performance.timing) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Only log if we have valid timing data
    if (loadTime > 0 && loadTime < 60000) { // Reasonable range: 0-60 seconds
      console.log(`⚡ Page loaded in ${loadTime}ms`);
      
      // Track performance for analytics
      if (loadTime < 3000) {
        console.log('✅ Excellent load performance');
      } else if (loadTime < 5000) {
        console.log('⚠️ Good load performance');
      } else {
        console.log('🔄 Consider optimizing load performance');
      }
    } else {
      console.log('⚡ Page loaded successfully');
    }
  }
});

// Add conversion tracking
window.addEventListener('beforeunload', function() {
  console.log('Conversion tracked:', {
    name: 'Session End',
    email: 'analytics@sceta.io'
  });
});
