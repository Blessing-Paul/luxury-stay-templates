
(() => {
  const bar = document.querySelector('.scroll-nav');
  const toggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.menu-overlay');
  let lastY = window.scrollY;
  let ticking = false;

  function updateNav() {
    const y = window.scrollY;
    const scrollingUp = y < lastY;
    // Keep the compact navigation hidden over the hero; reveal it only after
    // the visitor has left the hero and is scrolling upward.
    const hero = document.querySelector('.hero, .page-hero');
    const heroBottom = hero ? hero.offsetHeight : 0;
    if (y > heroBottom - 90 && scrollingUp && y > 120) {
      bar.classList.add('visible');
    } else if (!overlay.classList.contains('open')) {
      bar.classList.remove('visible');
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  function closeMenu() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeMenu();
  });
  overlay.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  const form = document.querySelector('.contact-form');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    alert('Thanks for your enquiry. Connect this form to a form service to receive messages.');
  });
})();
