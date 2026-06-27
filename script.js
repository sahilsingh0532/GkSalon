/**
 * GURUKRUPA UNISEX SALON — script.js
 * Handles: Navbar, scroll, particles, counters,
 * clock, gallery, booking form, availability, modal
 */

'use strict';

/* =============================================
   UTILITY
   ============================================= */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);


/* =============================================
   SCROLL PROGRESS BAR
   ============================================= */
function updateScrollProgress() {
  const el = $('scrollProgress');
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  el.style.width = pct + '%';
}


/* =============================================
   NAVBAR — sticky + scrolled state + hamburger
   ============================================= */
const navbar    = $('navbar');
const hamburger = $('hamburger');
const navLinks  = $('navLinks');

function updateNavbar() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a nav link is clicked
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Highlight active section in nav
function highlightActiveNav() {
  const sections = $$('section[id]');
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  $$('.nav-link').forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = 'var(--gold)';
    }
  });
}


/* =============================================
   BACK TO TOP
   ============================================= */
const backToTopBtn = $('backToTop');

function updateBackToTop() {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* =============================================
   HERO PARTICLES
   ============================================= */
function createParticles() {
  const container = $('heroParticles');
  const count = 18;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size  = Math.random() * 4 + 2;
    const left  = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur   = Math.random() * 6 + 6;
    const startY = 60 + Math.random() * 40;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      top: ${startY}%;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(p);
  }
}


/* =============================================
   SCROLL REVEAL — IntersectionObserver
   ============================================= */
function initReveal() {
  const targets = $$('.reveal-fade, .reveal-up, .reveal-left, .reveal-right');

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}


/* =============================================
   ANIMATED COUNTERS
   ============================================= */
function animateCounter(el, target, duration = 1800) {
  const start = 0;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuart
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('.counter-num');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}


/* =============================================
   LIVE CLOCK (Timings section)
   ============================================= */
function updateClock() {
  const hourHand   = $('clockHour');
  const minuteHand = $('clockMinute');
  if (!hourHand || !minuteHand) return;

  const now     = new Date();
  const hours   = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourDeg   = (hours / 12) * 360 + (minutes / 60) * 30;
  const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;

  hourHand.style.transform   = `translateX(-50%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
}

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);

  // Highlight today's row
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = days[new Date().getDay()];
  $$('.timing-row').forEach(row => {
    if (row.getAttribute('data-day') === today) {
      row.style.color = 'var(--gold)';
      row.style.fontWeight = '600';
    }
  });
}


/* =============================================
   AVAILABILITY CHECKER
   ============================================= */
function initAvailabilityChecker() {
  const btn     = $('checkAvailBtn');
  const result  = $('availResult');
  const dateIn  = $('checkDate');
  const timeIn  = $('checkTime');

  if (!btn) return;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  if (dateIn) dateIn.min = today;

  btn.addEventListener('click', () => {
    if (!dateIn.value || !timeIn.value) {
      showAvailResult(result, 'please-select', '⚠️ Please select both date and time.');
      return;
    }

    // Simulate loading
    btn.textContent = 'Checking...';
    btn.disabled = true;
    result.innerHTML = '';

    setTimeout(() => {
      btn.textContent = 'Check Availability';
      btn.disabled = false;

      const rand = Math.random();
      let cls, icon, msg;

      if (rand < 0.45) {
        cls  = 'available';
        icon = '✅';
        msg  = 'Available! This slot is open.';
      } else if (rand < 0.75) {
        cls  = 'limited';
        icon = '⚡';
        msg  = 'Limited Slots — Book soon!';
      } else {
        cls  = 'unavailable';
        icon = '❌';
        msg  = 'Fully Booked. Try another slot.';
      }

      result.innerHTML = `<div class="avail-badge ${cls}">${icon} ${msg}</div>`;
    }, 1200);
  });
}

function showAvailResult(container, cls, msg) {
  container.innerHTML = `<div class="avail-badge ${cls}">${msg}</div>`;
}


/* =============================================
   BOOKING FORM + MODAL
   ============================================= */
function initBookingForm() {
  const form    = $('bookingForm');
  const modal   = $('bookingModal');
  const closeBtn = $('closeModal');
  const dateInput = $('apptDate');

  if (!form) return;

  // Set min date
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name    = $('fullName').value.trim();
    const mobile  = $('mobile').value.trim();
    const date    = $('apptDate').value;
    const time    = $('apptTime').value;
    const service = $('service').value;

    if (!name || !mobile || !date || !time || !service) {
      // Shake invalid fields
      [{ id: 'fullName', val: name }, { id: 'mobile', val: mobile },
       { id: 'apptDate', val: date }, { id: 'apptTime', val: time },
       { id: 'service', val: service }].forEach(f => {
        if (!f.val) shakeField($(f.id));
      });
      return;
    }

    // Show modal
    modal.classList.add('open');
    form.reset();
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('open');
  });
}

function shakeField(el) {
  if (!el) return;
  el.style.borderColor = '#ef4444';
  el.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)';
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(-4px)' },
    { transform: 'translateX(4px)' },
    { transform: 'translateX(0)' }
  ], { duration: 350 });
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, 2000);
}


/* =============================================
   SMOOTH SCROLL for anchor links
   ============================================= */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = anchor.getAttribute('href');
      if (target === '#') return;
      const el = document.querySelector(target);
      if (el) {
        e.preventDefault();
        const offsetTop = el.offsetTop - 70;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });
}


/* =============================================
   GALLERY — keyboard / a11y
   ============================================= */
function initGallery() {
  $$('.gallery-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'img');
    item.setAttribute('aria-label', item.getAttribute('data-label') || 'Gallery image');
  });
}


/* =============================================
   SCROLL EVENT (throttled)
   ============================================= */
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollProgress();
      updateNavbar();
      updateBackToTop();
      highlightActiveNav();
      ticking = false;
    });
    ticking = true;
  }
}


/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initReveal();
  initCounters();
  initClock();
  initAvailabilityChecker();
  initBookingForm();
  initSmoothScroll();
  initGallery();

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load
  updateNavbar();
  updateBackToTop();
});