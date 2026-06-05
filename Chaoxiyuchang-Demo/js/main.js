/**
 * 官井洋渔场 — Main JS
 */
(function () {
  'use strict';

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });

  var nav = document.querySelector('.nav');
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.querySelector(this.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var form = document.getElementById('contactForm');
  var done = document.getElementById('formDone');
  if (form && done) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); done.classList.add('show'); form.reset();
      setTimeout(function () { done.classList.remove('show'); }, 4000);
    });
  }

  var ham = document.querySelector('.nav-hamburger');
  var panel = document.getElementById('mobilePanel');
  if (ham && panel) {
    ham.addEventListener('click', function () {
      var open = panel.classList.toggle('show');
      ham.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) nav.classList.add('scrolled');
    });
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        panel.classList.remove('show'); ham.classList.remove('open'); document.body.style.overflow = '';
      });
    });
  }
})();
