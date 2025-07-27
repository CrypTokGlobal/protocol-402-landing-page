
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
            }, 1000);

            // Track conversion
            trackConversion(data);

            // Scroll to success message
            successMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });

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

// Email validation with enhanced regex
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

// Enhanced loading state management
function setButtonLoading(loading) {
    submitButton.disabled = loading;
    if (loading) {
        submitButton.classList.add('loading');
        submitButton.innerHTML = `
            <span>Processing...</span>
            <span class="loading-spinner">⏳</span>
        `;
    } else {
        submitButton.classList.remove('loading');
        submitButton.innerHTML = `
            <span>Get the Whitepaper</span>
            <span class="download-icon">📄</span>
        `;
    }
}

// Enhanced error handling with better UX
function showError(message) {
    // Remove existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
        border: 2px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
        color: #dc2626;
        text-align: center;
        backdrop-filter: blur(10px);
        animation: shake 0.5s ease-in-out;
        font-weight: 500;
    `;
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">⚠️</span>
            <span>${message}</span>
        </div>
    `;
    
    downloadForm.appendChild(errorDiv);

    // Auto-hide after 6 seconds
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                errorDiv.remove();
            }, 300);
        }
    }, 6000);
}

// Enhanced download trigger
function triggerDownload() {
    const link = document.createElement('a');
    link.href = 'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf';
    link.target = '_blank';
    link.download = 'Protocol-402-SC-Digital-Infrastructure-Whitepaper.pdf';
    link.rel = 'noopener noreferrer';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Protocol 402 whitepaper download initiated');
}

// Enhanced analytics tracking
function trackConversion(data) {
    console.log('Conversion tracked:', data);

    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whitepaper_download', {
            event_category: 'engagement',
            event_label: 'Protocol 402 - SCETA',
            value: 1,
            user_properties: {
                'user_type': 'whitepaper_subscriber'
            }
        });
    }

    // Custom tracking for SCETA analytics
    if (window.scetaAnalytics) {
        window.scetaAnalytics.track('protocol_402_download', {
            name: data.name,
            email: data.email,
            timestamp: new Date().toISOString(),
            source: 'landing_page'
        });
    }
}

// Enhanced smooth scrolling and UX improvements
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

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
    }, observerOptions);

    // Observe feature cards for scroll animations
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Enhanced form interactions
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        // Focus effects
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });

        // Real-time validation feedback
        input.addEventListener('input', () => {
            if (input.type === 'email' && input.value) {
                if (isValidEmail(input.value)) {
                    input.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                    input.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                } else {
                    input.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                }
            } else if (input.value) {
                input.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                input.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
            } else {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }
        });
    });

    // Add keyboard navigation enhancements
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
            const form = e.target.closest('form');
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
    });
});

// Performance optimization and preloading
window.addEventListener('load', () => {
    // Preload critical resources
    const criticalResources = [
        'https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
    });

    // Add page load tracking
    console.log('🚀 SCETA Protocol 402 landing page fully loaded');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: 'Protocol 402 Landing Page',
            page_location: window.location.href
        });
    }
});

// Add CSS for shake animation
const shakeKeyframes = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = shakeKeyframes;
document.head.appendChild(styleSheet);
