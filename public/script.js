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

    form.addEventListener('submit', async function(e) {
      e.preventDefault(); // Always prevent default form submission

      try {
        updateTimestamp();

        const nameField = form.querySelector('input[name="name"]');
        const emailField = form.querySelector('input[name="email"]');
        const timestampField = form.querySelector('input[name="TIMESTAMP"]');

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
        const formattedName = toTitleCase(name);
        const formattedEmail = email.toLowerCase();

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        if (submitButton) {
          submitButton.textContent = 'Submitting...';
          submitButton.disabled = true;
        }

        // Prepare form data for SheetBest
        const formData = new FormData();
        formData.append('name', formattedName);
        formData.append('email', formattedEmail);
        formData.append('TIMESTAMP', timestampField.value);

        console.log('✅ Form validation passed, submitting to Sheet.best');

        // Submit to SheetBest API
        try {
          const response = await fetch('https://api.sheetbest.com/sheets/07bd8119-35d1-486f-9b88-8646578c0ef9', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            console.log('✅ Successfully submitted to SheetBest');

            // Short delay to show success, then redirect to PDF
            setTimeout(() => {
              console.log('🔗 Redirecting to PDF download...');
              window.location.href = '/whitepaper.pdf';
            }, 500);

          } else {
            throw new Error(`SheetBest API error: ${response.status}`);
          }

        } catch (fetchError) {
          console.error('❌ SheetBest submission failed:', fetchError);

          // Fallback: try backup route
          try {
            const backupResponse = await fetch('/submit-form', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: formattedName,
                email: formattedEmail,
                timestamp: timestampField.value
              })
            });

            const backupResult = await backupResponse.json();

            if (backupResult.success) {
              console.log('✅ Backup submission successful');
              setTimeout(() => {
                window.location.href = '/whitepaper.pdf';
              }, 500);
            } else {
              throw new Error(backupResult.error || 'Backup submission failed');
            }

          } catch (backupError) {
            console.error('❌ Backup submission also failed:', backupError);
            alert('Unable to submit form. Please try again.');

            // Reset button
            if (submitButton) {
              submitButton.textContent = originalText;
              submitButton.disabled = false;
            }
          }
        }

      } catch (error) {
        console.error('❌ Form submission error:', error);
        alert('An error occurred. Please try again.');

        // Reset button
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.textContent = 'SUBMIT & DOWNLOAD PDF';
          submitButton.disabled = false;
        }
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
      '/lady-justice-burgundy.png',
      '/sceta.png',
      '/usc-law.png',
      '/techinlaw.png',
      '/check-icon.svg',
      '/favicon.ico'
    ];

    let loadedCount = 0;
    let skippedCount = 0;
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
        // SVG and ICO files may not load via Image() but still work in the browser
        if (asset.includes('.svg') || asset.includes('.ico')) {
          console.log(`ℹ️ ${asset} - SVG/ICO file, assuming available`);
          results.push({ asset, status: 'skipped' });
          skippedCount++;
        } else {
          console.warn(`⚠️ Asset failed to load: ${asset}`);
          results.push({ asset, status: 'failed' });
          failedCount++;
        }
        checkComplete();
      };
      img.src = asset;
    });

    function checkComplete() {
      const totalProcessed = loadedCount + skippedCount + failedCount;
      if (!verificationComplete && totalProcessed === assets.length) {
        verificationComplete = true;
        console.log(`🎯 Asset verification completed: ${loadedCount}/${assets.length} loaded successfully${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`);
        if (failedCount > 0) {
          console.log(`⚠️ ${failedCount} assets failed to load`);
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
      if (timing.loadEventEnd > 0 && timing.loadEventEnd >= timing.navigationStart) {
        loadTime = timing.loadEventEnd - timing.navigationStart;
      } else if (document.readyState === 'complete') {
        // Use performance.now() for relative timing since page load
        const perfNow = Math.round(performance.now());
        loadTime = perfNow > 0 && perfNow < 60000 ? perfNow : 'complete';
      }

      console.log('⚡ Page performance metrics:', {
        domContentLoaded: domReady,
        loadComplete: loadTime,
        resourceCount: window.performance.getEntriesByType('resource').length,
        readyState: document.readyState
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

  // Enhanced Intersection Observer for sophisticated scroll animations
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('animate-in');

        // Special handling for cards with staggered animation
        if (entry.target.classList.contains('card')) {
          const cards = entry.target.parentElement.children;
          Array.from(cards).forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate-in');
            }, index * 150);
          });
        }
      }
    });
  }, observerOptions);

  // Enhanced animation observer for quote section
  const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out both';
      }
    });
  }, { threshold: 0.2 });

  // Observe sections for animations
  const sectionsToAnimate = document.querySelectorAll('.features, .card, footer');
  sectionsToAnimate.forEach(section => {
    observer.observe(section);
  });

  // Observe quote section for special animation
  const quoteSection = document.querySelector('.testimonial-quote');
  if (quoteSection) {
    quoteObserver.observe(quoteSection);
  }

  console.log('🎯 SCETA Protocol 402 - All systems ready');
});