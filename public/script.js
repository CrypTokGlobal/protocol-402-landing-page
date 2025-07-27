
// DOM Elements
const downloadForm = document.getElementById('downloadForm');
const successMessage = document.getElementById('successMessage');
const submitButton = downloadForm.querySelector('button[type="submit"]');

// Form Submission Handler
downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(downloadForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email')
    };
    
    // Basic validation
    if (!data.name.trim() || !data.email.trim()) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(data.email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    setButtonLoading(true);
    
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Show success message
            downloadForm.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Trigger download after a brief delay
            setTimeout(() => {
                triggerDownload();
            }, 1500);
            
            // Track conversion (could integrate with analytics)
            trackConversion(data);
            
        } else {
            showError(result.error || 'Something went wrong. Please try again.');
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        setButtonLoading(false);
    }
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Loading state management
function setButtonLoading(loading) {
    submitButton.disabled = loading;
    if (loading) {
        submitButton.classList.add('loading');
        submitButton.innerHTML = '<span>Processing...</span>';
    } else {
        submitButton.classList.remove('loading');
        submitButton.innerHTML = `
            <span>Get the Whitepaper</span>
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
        `;
    }
}

// Error handling
function showError(message) {
    // Create or update error message
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 1rem;
            margin-top: 1rem;
            color: #fff;
            text-align: center;
            backdrop-filter: blur(10px);
        `;
        downloadForm.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }, 5000);
}

// Download trigger
function triggerDownload() {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = '/whitepaper.pdf';
    link.download = 'Protocol-402-Whitepaper.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Analytics tracking (placeholder)
function trackConversion(data) {
    // In production, integrate with Google Analytics, Mixpanel, etc.
    console.log('Conversion tracked:', data);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whitepaper_download', {
            event_category: 'engagement',
            event_label: 'Protocol 402',
            value: 1
        });
    }
}

// Smooth scrolling for internal links
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll reveal animation for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe all feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
});

// Form enhancements
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', () => {
            input.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
            input.style.transform = 'scale(1)';
        });
        
        // Real-time validation feedback
        input.addEventListener('input', () => {
            if (input.type === 'email' && input.value) {
                if (isValidEmail(input.value)) {
                    input.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                } else {
                    input.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }
            }
        });
    });
});

// Performance optimization
window.addEventListener('load', () => {
    // Preload critical resources
    const criticalResources = [
        '/whitepaper.pdf'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.pdf') ? 'fetch' : 'script';
        document.head.appendChild(link);
    });
});
