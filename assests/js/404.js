// ===== 404 PAGE - MONGODB-INSPIRED INTERACTIVE JAVASCRIPT ===== //

// ===== Smooth Page Load ===== //
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
  
  // Initialize components
  initializeComponents();
});

// ===== Initialize All Components ===== //
function initializeComponents() {
  initSmoothScroll();
  initFloatingElements();
  initKeyboardShortcuts();
  initEmailCopy();
  logConsoleMessage();
}

// ===== Smooth Scroll for Navigation Links ===== //
function initSmoothScroll() {
  document.querySelectorAll('a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      window.location.href = href;
    });
  });
}

// ===== Random Floating Elements Movement ===== //
function initFloatingElements() {
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
}

// ===== Copy Email on Click ===== //
function initEmailCopy() {
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

  emailLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const email = this.href.replace('mailto:', '');
      
      // Try to copy to clipboard
      if (navigator.clipboard) {
        e.preventDefault();
        
        navigator.clipboard.writeText(email).then(() => {
          showNotification('📧 Email copied to clipboard!');
        }).catch(() => {
          // Fallback: still open mailto
          window.location.href = this.href;
        });
      }
    });
  });
}

// ===== Notification System ===== //
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 40px;
    right: 40px;
    padding: 16px 24px;
    background: var(--color-surface);
    border: 1px solid var(--color-primary);
    color: var(--color-text);
    font-family: var(--font-primary);
    font-size: 0.9375rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xl);
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

// ===== Keyboard Navigation ===== //
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Press 'H' or 'Escape' to go home
    if (e.key === 'h' || e.key === 'H' || e.key === 'Escape') {
      window.location.href = '/';
    }
    
    // Press 'W' to view work
    if (e.key === 'w' || e.key === 'W') {
      window.location.href = '/#work';
    }
    
    // Press 'C' to go to contact
    if (e.key === 'c' || e.key === 'C') {
      window.location.href = '/#contact';
    }
  });
}

// ===== Console Message ===== //
function logConsoleMessage() {
  const styles = {
    title: 'font-size: 24px; font-weight: bold; color: #00ED64; text-shadow: 0 0 10px rgba(0, 237, 100, 0.5);',
    subtitle: 'font-size: 14px; color: #B8C5D0;',
    info: 'font-size: 12px; color: #7E91A0; font-style: italic;'
  };
  
  console.log('%c404 - Page Not Found', styles.title);
  console.log('%cLooks like this page got lost! Head back to safety:', styles.subtitle);
  console.log('%c/ (Home)', styles.info);
  console.log('%c\nKeyboard Shortcuts:', styles.subtitle);
  console.log('%cH or Escape: Go to home', styles.info);
  console.log('%cW: Jump to work section', styles.info);
  console.log('%cC: Jump to contact section', styles.info);
}

// ===== Performance Monitoring ===== //
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`⚡ 404 page loaded in ${loadTime.toFixed(2)}ms`);
});

// ===== Accessibility: Reduced Motion ===== //
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(style);
}

console.log('✨ 404 page JavaScript loaded successfully!');