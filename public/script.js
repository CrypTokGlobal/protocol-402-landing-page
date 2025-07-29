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
        updateTimestamp();

        const nameField = form.querySelector('input[name="name"]');
        const emailField = form.querySelector('input[name="email"]');

        if (!nameField || !emailField) {
          console.error('❌ Form fields not found');
          e.preventDefault();
          return;
        }

        // Enhanced validation
        const name = nameField.value.trim();
        const email = emailField.value.trim();

        if (!name || name.length < 2) {
          e.preventDefault();
          alert('Please enter a valid name (at least 2 characters)');
          nameField.focus();
          return;
        }

        if (!email || !isValidEmail(email)) {
          e.preventDefault();
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

        // Log successful validation - form will submit naturally to Sheet.best
        console.log('✅ Form validation passed, submitting to Sheet.best');
        
        // Don't prevent default - let the form submit to Sheet.best
        // The action URL in the HTML will handle the redirect
        
      } catch (error) {
        console.error('❌ Form submission error:', error);
        e.preventDefault();
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.toLowerCase());
  }

  // Enhanced asset verification with detailed reporting
  function verifyAssets() {
    console.log('🔍 Verifying critical assets...');
    const assets = [
      '/sceta.png', 
      '/usc-law.png', 
      '/techinlaw.png', 
      '/lady-justice.png', 
      '/check-icon.svg'
    ];
    
    let loadedCount = 0;
    let failedCount = 0;
    let verificationComplete = false;
    const results = [];
    
    assets.forEach(asset => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Asset verified: ${asset}`);
        results.push({ asset, status: 'loaded' });
        loadedCount++;
        checkComplete();
      };
      img.onerror = () => {
        console.warn(`⚠️ Asset failed to load: ${asset} - This may be normal for SVG/ICO files`);
        results.push({ asset, status: 'failed' });
        failedCount++;
        checkComplete();
      };
      img.src = asset;
    });
    
    function checkComplete() {
      if (!verificationComplete && loadedCount + failedCount === assets.length) {
        verificationComplete = true;
        console.log(`🎯 Asset verification completed: ${loadedCount}/${assets.length} loaded successfully`);
        if (failedCount > 0) {
          console.log(`⚠️ ${failedCount} assets failed to load but this may be normal for some file types`);
          console.log('📋 Failed assets:', results.filter(r => r.status === 'failed').map(r => r.asset));
        }
      }
    }
  }

  // Performance monitoring
  function logPerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      
      // Calculate DOM ready time
      const domReady = timing.domContentLoadedEventEnd > timing.navigationStart 
        ? timing.domContentLoadedEventEnd - timing.navigationStart 
        : 0;
      
      // Calculate load complete time with proper validation
      let loadTime = 'pending';
      if (timing.loadEventEnd > 0 && timing.loadEventEnd > timing.navigationStart) {
        loadTime = timing.loadEventEnd - timing.navigationStart;
      }
      
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