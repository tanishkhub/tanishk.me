// ===== MONGODB-INSPIRED PORTFOLIO - INTERACTIVE JAVASCRIPT ===== //

// ===== Smooth Page Load ===== //
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.6s ease';
    document.body.style.opacity = '1';
  }, 100);
  
  // Initialize all components
  initializeComponents();
});

// ===== Initialize Components ===== //
function initializeComponents() {
  if (window.innerWidth > 1024) {
    initCustomCursor();
  }
  initMobileMenu();
  initScrollAnimations();
  initProjectCards();
  initScrollProgress();
  initSmoothScroll();
  initActiveSection();
  initFormHandling();
  initStats();
  initKeyboardShortcuts();
  logWelcomeMessage();
}

// ===== Custom Cursor ===== //
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let followerX = 0;
let followerY = 0;

function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  if (!cursor || !cursorFollower) return;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.9;
    cursorY += (mouseY - cursorY) * 0.9;
    
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    
    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
}

// ===== Mobile Menu ===== //
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navLinks.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  // Close menu when clicking on a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ===== Scroll-Triggered Navigation ===== //
const mainNav = document.querySelector('.main-nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Add scrolled class for styling
  if (currentScroll > 50) {
    mainNav?.classList.add('scrolled');
  } else {
    mainNav?.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ===== Smooth Scroll for Anchor Links ===== //
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      
      if (target) {
        const navHeight = mainNav ? mainNav.offsetHeight : 0;
        const targetPosition = target.offsetTop - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== Intersection Observer for Scroll Animations ===== //
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        // Stagger animations for child elements
        const children = entry.target.querySelectorAll('.stagger-animate');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('animate-in');
          }, index * 100);
        });
        
        // Unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe sections
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
  
  // Observe cards
  document.querySelectorAll('.project-card, .capability-card').forEach(card => {
    observer.observe(card);
  });
}

// ===== Project Card Hover Effects ===== //
function initProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '';
    });
  });
}

// ===== Scroll Progress Indicator ===== //
function initScrollProgress() {
  // Create progress bar if it doesn't exist
  let progressBar = document.querySelector('.scroll-progress');
  
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
  }
  
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// ===== Animated Stats Counter ===== //
function initStats() {
  const stats = document.querySelectorAll('.stat-number');
  let counted = false;
  
  function animateStats() {
    if (counted) return;
    
    stats.forEach(stat => {
      const target = stat.textContent;
      const match = target.match(/\d+/);
      
      if (match) {
        const num = parseInt(match[0]);
        const suffix = target.replace(/\d+/, '');
        const increment = num / 50;
        let current = 0;
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= num) {
            stat.textContent = num + suffix;
            clearInterval(counter);
          } else {
            stat.textContent = Math.ceil(current) + suffix;
          }
        }, 30);
      }
    });
    
    counted = true;
  }
  
  // Trigger stats animation on scroll
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
        }
      });
    }, { threshold: 0.5 });
    
    statsObserver.observe(heroStats);
  }
}

// ===== Form Handling ===== //
function initFormHandling() {
  const contactForm = document.querySelector('.contact-form');
  
  if (!contactForm) return;
  
  const inputs = contactForm.querySelectorAll('input, textarea');
  
  // Enhanced focus states
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement?.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement?.classList.remove('focused');
      }
    });
  });
  
  // Form submission
  contactForm.addEventListener('submit', function(e) {
    const submitBtn = this.querySelector('button[type="submit"]');
    
    if (submitBtn) {
      const btnText = submitBtn.querySelector('span');
      const originalText = btnText?.textContent || 'Send Message';
      
      if (btnText) {
        btnText.textContent = 'Sending...';
      }
      submitBtn.disabled = true;
      
      // Reset after delay (form will submit to Formspree)
      setTimeout(() => {
        if (btnText) {
          btnText.textContent = originalText;
        }
        submitBtn.disabled = false;
      }, 3000);
    }
  });
}

// ===== Active Section Highlighting ===== //
function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navigationLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  function highlightActiveSection() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navigationLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  
  window.addEventListener('scroll', highlightActiveSection);
}

// ===== Copy Email to Clipboard ===== //
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
        // Fallback: open mailto
        window.location.href = this.href;
      });
    }
  });
});

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
  
  // Add animation styles
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
  
  if (!document.querySelector('#notification-styles')) {
    style.id = 'notification-styles';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ===== Keyboard Shortcuts ===== //
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Alt + H: Go to home/hero
    if (e.altKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Alt + W: Go to work section
    if (e.altKey && (e.key === 'w' || e.key === 'W')) {
      e.preventDefault();
      const workSection = document.querySelector('#work');
      if (workSection) {
        const navHeight = mainNav ? mainNav.offsetHeight : 0;
        window.scrollTo({
          top: workSection.offsetTop - navHeight - 20,
          behavior: 'smooth'
        });
      }
    }
    
    // Alt + C: Go to contact section
    if (e.altKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        const navHeight = mainNav ? mainNav.offsetHeight : 0;
        window.scrollTo({
          top: contactSection.offsetTop - navHeight - 20,
          behavior: 'smooth'
        });
      }
    }
  });
}

// ===== Lazy Loading Images ===== //
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      }
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});

// ===== Tech Stack Item Animation ===== //
const techItems = document.querySelectorAll('.tech-grid span');
techItems.forEach((item, index) => {
  item.style.animationDelay = `${index * 0.03}s`;
});

// ===== Parallax Effect (subtle) ===== //
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  parallaxElements.forEach(element => {
    const speed = parseFloat(element.dataset.parallax) || 0.5;
    const yPos = -(scrolled * speed);
    element.style.transform = `translateY(${yPos}px)`;
  });
});

// ===== Console Easter Egg ===== //
function logWelcomeMessage() {
  const styles = {
    title: 'font-size: 24px; font-weight: bold; color: #00ED64; text-shadow: 0 0 10px rgba(0, 237, 100, 0.5);',
    subtitle: 'font-size: 14px; color: #B8C5D0;',
    info: 'font-size: 12px; color: #7E91A0; font-style: italic;'
  };
  
  console.log('%c🚀 Welcome to My Portfolio!', styles.title);
  console.log('%cBuilt with MongoDB-inspired design principles', styles.subtitle);
  console.log('%cEmail: tanishk0297@gmail.com', styles.info);
  console.log('%c\nKeyboard Shortcuts:', styles.subtitle);
  console.log('%cAlt + H: Scroll to top', styles.info);
  console.log('%cAlt + W: Jump to work section', styles.info);
  console.log('%cAlt + C: Jump to contact section', styles.info);
}

// ===== Performance Monitoring ===== //
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`⚡ Portfolio loaded in ${loadTime.toFixed(2)}ms`);
  
  // Log paint timing
  if (window.performance && window.performance.getEntriesByType) {
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
    });
  }
});

// ===== Project Links Analytics ===== //
const projectLinks = document.querySelectorAll('.project-link');
projectLinks.forEach(link => {
  link.addEventListener('click', function() {
    const projectCard = this.closest('.project-card');
    const projectTitle = projectCard?.querySelector('.project-title')?.textContent || 'Unknown';
    const linkText = this.textContent.trim();
    
    console.log(`🔗 Clicked: ${projectTitle} - ${linkText}`);
  });
});

// ===== Floating Cards Animation ===== //
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card, index) => {
  // Add subtle random movement
  setInterval(() => {
    const randomX = (Math.random() - 0.5) * 15;
    const randomY = (Math.random() - 0.5) * 15;
    const currentTransform = card.style.transform || '';
    const baseTransform = currentTransform.split('translate')[0].trim();
    card.style.transform = `${baseTransform} translate(${randomX}px, ${randomY}px)`;
  }, 4000 + (index * 1000));
});

// ===== Accessibility: Reduced Motion ===== //
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // Disable animations for users who prefer reduced motion
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

// ===== Debounce Helper ===== //
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== Throttle Helper ===== //
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ===== Responsive Image Loading ===== //
function updateImageSources() {
  const images = document.querySelectorAll('img[data-src-mobile]');
  const isMobile = window.innerWidth <= 768;
  
  images.forEach(img => {
    const src = isMobile ? img.dataset.srcMobile : img.dataset.src;
    if (src && img.src !== src) {
      img.src = src;
    }
  });
}

// Update on resize (debounced)
window.addEventListener('resize', debounce(updateImageSources, 300));

// ===== Final Initialization Log ===== //
console.log('✨ Portfolio JavaScript loaded successfully!');
console.log('🎯 All interactive features initialized');