// ===== AWARD-WINNING PORTFOLIO - INTERACTIVE JAVASCRIPT ===== //

// ===== Custom Cursor =====//
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let followerX = 0;
let followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  // Smooth cursor movement
  cursorX += (mouseX - cursorX) * 0.9;
  cursorY += (mouseY - cursorY) * 0.9;
  
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  
  if (cursor && cursorFollower) {
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    
    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;
  }
  
  requestAnimationFrame(animateCursor);
}

if (window.innerWidth > 1024) {
  animateCursor();
}

// ===== Mobile Menu Toggle ===== //
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });
  
  // Close menu when clicking on a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });
}

// ===== Scroll-Triggered Navigation ===== //
const mainNav = document.querySelector('.main-nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    mainNav.classList.add('scrolled');
  } else {
    mainNav.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ===== Smooth Scroll for Anchor Links ===== //
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const navHeight = mainNav ? mainNav.offsetHeight : 0;
      const targetPosition = target.offsetTop - navHeight - 40;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== Intersection Observer for Scroll Animations ===== //
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
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
    }
  });
}, observerOptions);

// Observe elements
document.addEventListener('DOMContentLoaded', () => {
  // Sections to observe
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Cards to observe
  const cards = document.querySelectorAll('.project-card, .capability-card');
  cards.forEach(card => {
    observer.observe(card);
  });
});

// ===== Project Card 3D Tilt Effect ===== //
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
  card.addEventListener('mousemove', handleTilt);
  card.addEventListener('mouseleave', resetTilt);
});

function handleTilt(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = (y - centerY) / 25;
  const rotateY = (centerX - x) / 25;
  
  card.style.transform = `
    perspective(1000px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    translateY(-8px)
  `;
}

function resetTilt(e) {
  const card = e.currentTarget;
  card.style.transform = '';
}

// ===== Parallax Effect ===== //
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  parallaxElements.forEach(element => {
    const speed = element.dataset.parallax || 0.5;
    const yPos = -(scrolled * speed);
    element.style.transform = `translateY(${yPos}px)`;
  });
});

// ===== Animated Stats Counter ===== //
const stats = document.querySelectorAll('.stat-number');
let counted = false;

function animateStats() {
  if (counted) return;
  
  stats.forEach(stat => {
    const target = stat.textContent;
    const isNumber = !isNaN(parseInt(target));
    
    if (isNumber) {
      const num = parseInt(target.replace(/[^0-9]/g, ''));
      const increment = num / 50;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= num) {
          stat.textContent = target;
          clearInterval(counter);
        } else {
          stat.textContent = Math.ceil(current) + '+';
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

// ===== Form Handling ===== //
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const inputs = contactForm.querySelectorAll('input, textarea');
  
  // Enhanced focus states
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
    
    // Real-time validation
    input.addEventListener('input', function() {
      if (this.checkValidity()) {
        this.style.borderColor = 'var(--color-olive)';
      } else {
        this.style.borderColor = 'var(--color-border)';
      }
    });
  });
  
  // Form submission
  contactForm.addEventListener('submit', function(e) {
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.querySelector('span').textContent;
    
    submitBtn.querySelector('span').textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Form will submit normally to Formspree
    // Reset after a delay for better UX
    setTimeout(() => {
      submitBtn.querySelector('span').textContent = originalText;
      submitBtn.disabled = false;
    }, 3000);
  });
}

// ===== Scroll Progress Indicator ===== //
function createScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-terracotta) 0%, var(--color-coral) 100%);
    width: 0%;
    z-index: 10001;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

createScrollProgress();

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

// ===== Copy to Clipboard ===== //
const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

emailLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const email = this.href.replace('mailto:', '');
    
    navigator.clipboard.writeText(email).then(() => {
      showNotification('Email copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
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
    background: var(--color-navy);
    color: var(--color-white);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 700;
    border-radius: 8px;
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
  
  .animate-in {
    animation: fadeInUp 0.8s var(--ease-smooth) backwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// ===== Active Section Highlighting ===== //
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

// ===== Tech Stack Animations ===== //
const techItems = document.querySelectorAll('.tech-grid span');
techItems.forEach((item, index) => {
  item.style.animationDelay = `${index * 0.05}s`;
});

// ===== Console Easter Egg ===== //
console.log('%cHey there! ðŸ‘‹', 'font-size: 24px; font-weight: bold; color: #D4634A;');
console.log('%cLike what you see? Let\'s build something together!', 'font-size: 14px; color: #1A2332;');
console.log('%cEmail: tanishk0297@gmail.com', 'font-size: 12px; color: #64748B;');

// ===== Performance Monitoring ===== //
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`âš¡ Portfolio loaded in ${loadTime.toFixed(2)}ms`);
  
  // Log paint timing
  if (window.performance && window.performance.getEntriesByType) {
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      console.log(`ðŸŽ¨ ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
    });
  }
});

// ===== Keyboard Navigation ===== //
document.addEventListener('keydown', (e) => {
  // Escape key closes mobile menu
  if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
  }
});

// ===== Smooth Page Load ===== //
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// ===== Project Links Analytics (Optional) ===== //
const projectLinks = document.querySelectorAll('.project-link');
projectLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const projectName = this.closest('.project-card').querySelector('.project-title').textContent;
    const linkType = this.textContent.trim();
    
    console.log(`ðŸ“Š Clicked: ${projectName} - ${linkType}`);
    // Here you could add analytics tracking
  });
});

// ===== Floating Cards Animation ===== //
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card, index) => {
  // Add random movement
  setInterval(() => {
    const randomX = (Math.random() - 0.5) * 20;
    const randomY = (Math.random() - 0.5) * 20;
    card.style.transform = `translate(${randomX}px, ${randomY}px)`;
  }, 3000 + (index * 1000));
});

// ===== Accessibility: Reduced Motion ===== //
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // Disable animations for users who prefer reduced motion
  document.documentElement.style.setProperty('--ease-smooth', 'ease');
  
  // Remove floating animations
  floatingCards.forEach(card => {
    card.style.animation = 'none';
  });
}

console.log('âœ¨ Portfolio JavaScript loaded successfully!');