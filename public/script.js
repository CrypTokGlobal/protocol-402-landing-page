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
});il"]');

        if (nameField && nameField.value) {
          nameField.value = toTitleCase(nameField.value.trim());
        }

        if (emailField && emailField.value) {
          emailField.value = emailField.value.toLowerCase().trim();
        }

        console.log('📤 Form submitted with Sheet.best integration');

        // Enhanced fallback PDF download with delay
        setTimeout(() => {
          try {
            const pdfUrl = 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf';
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'Protocol-402-SCETA-Whitepaper.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('📥 PDF download initiated');
          } catch (downloadError) {
            console.error('❌ PDF download failed:', downloadError);
          }
        }, 1500);

        // Redirect to thank you page with delay
        setTimeout(() => {
          try {
            console.log('🔄 Redirecting to thank-you page');
            window.location.href = '/thank-you.html';
          } catch (redirectError) {
            console.error('❌ Redirect failed:', redirectError);
          }
        }, 2000);

      } catch (error) {
        console.error('❌ Form submission error:', error);
      }
    });
  }

  // Developer Note: Enhanced page visibility tracking for analytics
  document.addEventListener('visibilitychange', function() {
    try {
      if (document.visibilityState === 'visible') {
        console.log('📱 Page visible');
        updateTimestamp();
      } else {
        console.log('📱 Page hidden');
      }
    } catch (error) {
      console.error('❌ Visibility tracking error:', error);
    }
  });

  // Developer Note: Enhanced logo loading verification with proper error handling
  const logos = document.querySelectorAll('.partner-logo, .footer-logo');
  logos.forEach(logo => {
    if (logo.complete && logo.naturalHeight !== 0) {
      console.log(`✅ Logo loaded successfully: ${logo.alt} from ${logo.src}`);
    } else {
      logo.addEventListener('load', function() {
        console.log(`✅ Logo loaded successfully: ${this.alt} from ${this.src}`);
      });
      logo.addEventListener('error', function() {
        console.error(`❌ Logo failed to load: ${this.alt} from ${this.src}`);
      });
    }
  });

  // Developer Note: Enhanced asset verification with memory-efficient cleanup
  let assetVerificationRunning = false;
  let assetVerificationPromise = null;

  async function verifyAssets() {
    if (assetVerificationRunning) {
      return assetVerificationPromise;
    }

    assetVerificationRunning = true;

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
    assetVerificationRunning = false;
    assetVerificationPromise = null;
    console.log('✅ Asset verification completed');
  }

  // Store the promise and run asset verification
  assetVerificationPromise = verifyAssets();

  // Developer Note: Enhanced performance monitoring with safe error handling
  window.addEventListener('load', function() {
    try {
      setTimeout(() => {
        const perfData = performance.timing;
        if (perfData) {
          console.log('⚡ Page performance metrics:', {
            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
            loadComplete: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            resourceCount: performance.getEntriesByType('resource').length
          });
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Performance monitoring error:', error);
    }
  });

  // Production-ready global error handlers with enhanced logging
  window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection prevented:', event.reason);
    console.error('❌ Promise:', event.promise);
    console.error('❌ Stack trace:', event.reason?.stack);

    // Send critical errors to monitoring (in production, you'd send to your logging service)
    if (event.reason && event.reason.message && event.reason.message.includes('network')) {
      console.warn('🌐 Network error detected - check connectivity');
    }

    event.preventDefault();
  });

  window.addEventListener('error', function(event) {
    console.error('❌ Global error caught:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });

    // Don't let errors break the user experience
    event.preventDefault();
  });
});