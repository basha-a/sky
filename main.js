// shared site script (loaded with defer on every page)

// footer year
document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// services: sticky image swaps as each service scrolls into view
const services = document.querySelectorAll('.service');
const contents = document.querySelectorAll('.content');

if (services.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.service;

          contents.forEach(content => {
            content.classList.remove('active');
          });

          document
            .querySelector(`.content[data-content="${id}"]`)
            .classList.add('active');

          // highlight current service text + progress dot
          services.forEach(s => s.classList.toggle('is-active', s === entry.target));
          document.querySelectorAll('.service-progress [data-dot]').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.dot === id);
          });
        }
      });
    },
    {
      threshold: 0.6 // 60% of service visible
    }
  );

  services.forEach(service => observer.observe(service));
}

// contact form: posts to Google Forms through a hidden iframe
const contactForm = document.querySelector('#contactForm');

if (contactForm) {
  let submitted = false;
  contactForm.addEventListener('submit', () => {
    submitted = true;
  });
  document.querySelector('#hidden_iframe').addEventListener('load', () => {
    if (!submitted) return;
    submitted = false;
    contactForm.reset();
    document.querySelector('#formSuccess').classList.add('show');
  });
}

// scroll animations
if (window.AOS) {
  AOS.init({
    duration: 1000,   // animation duration (ms)
    once: true,       // animate only once
    offset: 120,      // trigger point
    easing: "ease-in-out"
  });
}
