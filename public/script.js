// Check if Lady Justice image loads properly
document.addEventListener('DOMContentLoaded', function() {
  const ladyJusticeImg = document.querySelector('.lady-justice');

  if (ladyJusticeImg) {
    ladyJusticeImg.addEventListener('error', function() {
      console.warn('Lady Justice image failed to load');
      // Hide the image if it fails to load to prevent broken image icon
      this.style.display = 'none';
    });

    ladyJusticeImg.addEventListener('load', function() {
      console.log('Lady Justice image loaded successfully');
      // Mark as LCP candidate
      this.setAttribute('data-lcp', 'true');
    });
  }

  // Log when page is fully loaded for debugging
  window.addEventListener('load', function() {
    console.log('🚀 SCETA Protocol 402 landing page fully loaded');
  });
});

// Add event listener to the form
document.getElementById('whitepaperForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {
    name: formData.get('name'),
    email: formData.get('email')
  };

  console.log('Conversion tracked:', data);

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
      // Start the download
      window.open(result.downloadUrl, '_blank');

      // Show success message
      const button = this.querySelector('button');
      const originalText = button.textContent;
      button.textContent = '✅ Download Started!';
      button.style.background = '#28a745';

      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#F5C518';
      }, 3000);

      // Reset form
      this.reset();
    } else {
      throw new Error(result.error || 'Something went wrong');
    }
  } catch (error) {
    console.error('Error:', error);
    const button = this.querySelector('button');
    const originalText = button.textContent;
    button.textContent = '❌ Error - Try Again';
    button.style.background = '#dc3545';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#F5C518';
    }, 3000);
  }
});