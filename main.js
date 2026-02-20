const revealElements = document.querySelectorAll('.reveal, .reveal-card');

document.querySelectorAll('.reveal-card').forEach((card, index) => {
  card.classList.add(index % 2 === 0 ? 'from-left' : 'from-right');
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) {
      siteNav.querySelectorAll('details[open]').forEach((details) => {
        details.removeAttribute('open');
      });
    }
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.querySelectorAll('details[open]').forEach((details) => {
        details.removeAttribute('open');
      });
    });
  });
}
