// ===== 404 PAGE - INTERACTIVE JAVASCRIPT ===== //

// ===== Smooth Page Load ===== //
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// ===== Smooth Scroll for Navigation Links ===== //
document.querySelectorAll('a[href^="/#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    window.location.href = href;
  });
});

// ===== Random Floating Elements Movement ===== //
const floatingElements = document.querySelectorAll('.floating-element');

floatingElements.forEach((element, index) => {
  // Add random movement every few seconds
  setInterval(() => {
    const randomX = (Math.random() - 0.5) * 100;
    const randomY = (Math.random() - 0.5) * 100;
    const randomRotate = (Math.random() - 0.5) * 30;
    
    element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
  }, 4000 + (index * 1000));
});

// ===== Console Message ===== //
console.log('%c404 - Page Not Found', 'font-size: 24px; font-weight: bold; color: #D4634A;');
console.log('%cLooks like this page got lost! Head back to safety:', 'font-size: 14px; color: #1A2332;');
console.log('%c/', 'font-size: 12px; color: #64748B; font-style: italic;');

// ===== Performance Monitoring ===== //
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`âš¡ 404 page loaded in ${loadTime.toFixed(2)}ms`);
});

// ===== Copy Email on Click (if email links present) ===== //
const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

emailLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const email = this.href.replace('mailto:', '');
    
    navigator.clipboard.writeText(email).then(() => {
      showNotification('Email copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      // Fallback: still open mailto
      window.location.href = this.href;
    });
  });
});

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 40px;
    right: 40px;
    padding: 16px 24px;
    background: #1A2332;
    color: #FFFFFF;
    font-family: 'Space Mono', monospace;
    font-size: 0.875rem;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(26, 35, 50, 0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease forwards;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// ===== Accessibility: Keyboard Navigation ===== //
document.addEventListener('keydown', (e) => {
  // Press 'H' to go home
  if (e.key === 'h' || e.key === 'H') {
    window.location.href = '/';
  }
  
  // Press 'W' to view work
  if (e.key === 'w' || e.key === 'W') {
    window.location.href = '/#work';
  }
});

console.log('ðŸ’¡ Keyboard shortcuts: Press H for Home, W for Work');
console.log('âœ¨ 404 page JavaScript loaded successfully!');