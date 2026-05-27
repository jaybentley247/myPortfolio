// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Reveal on scroll
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

// Stagger reveals in sections
document.querySelectorAll('section, .info-grid, .projects-grid, .services-grid, .contact-links').forEach(sec => {
  const reveals = sec.querySelectorAll('.reveal');
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });
});
