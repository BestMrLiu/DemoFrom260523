document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initGSAP();
  initCarousel();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero 内容入场
  gsap.from('#hero .relative', {
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power3.out',
  });

  // 通用：各 section 内容交错入场
  const sections = ['#about', '#services', '#portfolio', '#contact', '#faq'];
  sections.forEach((selector) => {
    gsap.from(`${selector} > div`, {
      scrollTrigger: {
        trigger: selector,
        start: 'top 80%',
        end: 'top 30%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'power2.out',
    });
  });

  // 数字计数动画
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target = parseInt(el.dataset.target);
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      innerText: target,
      duration: 1.5,
      snap: { innerText: 1 },
      ease: 'power1.out',
    });
  });

  // 服务卡片交错入场
  gsap.from('.service-card', {
    scrollTrigger: {
      trigger: '#services',
      start: 'top 70%',
    },
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power2.out',
  });

  // 作品集卡片交错入场
  gsap.from('.portfolio-card', {
    scrollTrigger: {
      trigger: '#portfolio',
      start: 'top 70%',
    },
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power2.out',
  });
}

function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const cards = track.querySelectorAll('.portfolio-card');
  const cardWidth = 280 + 24; // card width + gap

  // Auto-scroll
  let scrollPosition = 0;
  let isAutoScrolling = true;

  function autoScroll() {
    if (!isAutoScrolling) return;

    scrollPosition += cardWidth;
    if (scrollPosition >= track.scrollWidth - track.clientWidth) {
      scrollPosition = 0;
    }

    track.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    setTimeout(autoScroll, 4000);
  }

  // Start auto-scroll
  setTimeout(autoScroll, 2000);

  // Pause on hover
  track.addEventListener('mouseenter', () => {
    isAutoScrolling = false;
  });

  track.addEventListener('mouseleave', () => {
    isAutoScrolling = true;
    setTimeout(autoScroll, 2000);
  });

  // Arrow buttons
  const leftArrow = document.querySelector('.carousel-arrow-left');
  const rightArrow = document.querySelector('.carousel-arrow-right');

  if (leftArrow) {
    leftArrow.addEventListener('click', () => {
      isAutoScrolling = false;
      scrollPosition = Math.max(0, scrollPosition - cardWidth);
      track.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });
  }

  if (rightArrow) {
    rightArrow.addEventListener('click', () => {
      isAutoScrolling = false;
      scrollPosition = Math.min(track.scrollWidth - track.clientWidth, scrollPosition + cardWidth);
      track.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });
  }
}
