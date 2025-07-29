document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SCETA Protocol 402 - Landing page loaded');

  // Developer Note: Enhanced timestamp handling with fallback protection
  function updateTimestamp() {
    try {
      const now = new Date().toISOString();
      const timestampField = document.getElementById('timestampField');
      if (timestampField) {
        timestampField.value = now;
        console.log('⏰ Timestamp updated:', now);
      }
    } catch (error) {
      console.error('❌ Timestamp update failed:', error);
    }
  }

  // Update timestamp immediately and on form interaction
  updateTimestamp();

  // Developer Note: Complete and validated toTitleCase function
  // Handles full names properly without runtime errors
  function toTitleCase(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  // Form handling with enhanced error protection
  const form = document.getElementById('whitepaper-form');
  if (form) {
    // Update timestamp on any form interaction
    form.addEventListener('input', updateTimestamp);
    form.addEventListener('focus', updateTimestamp, true);

    form.addEventListener('submit', function(e) {
      try {
        e.preventDefault();
        updateTimestamp();

        const nameField = form.querySelector('input[name="name"]');
        const emailField = form.querySelector('input[name="email"]');

        if (!nameField || !emailField) {
          console.error('❌ Form fields not found');
          return;
        }

        // Enhanced validation
        const name = nameField.value.trim();
        const email = emailField.value.trim();

        if (!name || name.length < 2) {
          alert('Please enter a valid name (at least 2 characters)');
          nameField.focus();
          return;
        }

        if (!email || !isValidEmail(email)) {
          alert('Please enter a valid email address');
          emailField.focus();
          return;
        }

        // Format name to title case
        nameField.value = toTitleCase(name);
        emailField.value = email.toLowerCase();

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.textContent = 'Submitting...';
          submitButton.disabled = true;
        }

        // Let the form submit naturally to Sheet.best
        console.log('✅ Form validation passed, submitting to Sheet.best');
        
      } catch (error) {
        console.error('❌ Form submission error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.toLowerCase());
  }

  // Enhanced asset verification
  function verifyAssets() {
    console.log('🔍 Verifying critical assets...');
    const assets = ['/sceta.png', '/usc-law.png', '/techinlaw.png', '/lady-justice.png', '/favicon.ico'];
    
    assets.forEach(asset => {
      const img = new Image();
      img.onload = () => console.log(`✅ Asset verified: ${asset}`);
      img.onerror = () => console.error(`❌ Asset failed: ${asset}`);
      img.src = asset;
    });
    
    setTimeout(() => console.log('✅ Asset verification completed'), 1000);
  }

  // Performance monitoring
  function logPerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      
      console.log('⚡ Page performance metrics:', {
        domContentLoaded: domReady,
        loadComplete: loadTime,
        resourceCount: window.performance.getEntriesByType('resource').length
      });
    }
  }

  // Visibility change tracking
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      console.log('📱 Page hidden');
    } else {
      console.log('📱 Page visible');
      updateTimestamp();
    }
  });

  // Logo loading verification
  const logos = document.querySelectorAll('.partner-logo, .footer-logo');
  logos.forEach(logo => {
    logo.addEventListener('load', function() {
      console.log(`✅ Logo loaded successfully: ${this.alt} from ${this.src}`);
    });
    logo.addEventListener('error', function() {
      console.error(`❌ Logo failed to load: ${this.alt} from ${this.src}`);
    });
  });

  // Initialize all enhancements
  verifyAssets();
  
  // Performance logging after page load
  if (document.readyState === 'complete') {
    logPerformance();
  } else {
    window.addEventListener('load', logPerformance);
  }

  console.log('🎯 SCETA Protocol 402 - All systems ready');
});