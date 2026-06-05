/**
 * 菌语山房 — Mobile hamburger + responsive + refined UI
 */
(function(){
  'use strict';
  var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('visible');o.unobserve(x.target)}})},{threshold:0.1});
  document.querySelectorAll('.reveal').forEach(function(el){o.observe(el)});

  var n=document.querySelector('.nav');
  window.addEventListener('scroll',function(){n.classList.toggle('scrolled',pageYOffset>40)},{passive:true});

  document.querySelectorAll('a[href^="#"]').forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();var t=document.querySelector(this.getAttribute('href'));if(t)t.scrollIntoView({behavior:'smooth'})})});

  var f=document.getElementById('contactForm'),d=document.getElementById('fdone');
  if(f&&d){f.addEventListener('submit',function(e){e.preventDefault();d.classList.add('show');f.reset();setTimeout(function(){d.classList.remove('show')},4000)})}

  // Hamburger
  var ham=document.getElementById('navHam'),mp=document.getElementById('mobilePanel'),navEl=document.querySelector('.nav');
  if(ham&&mp){
    ham.addEventListener('click',function(){
      mp.classList.toggle('show');ham.classList.toggle('open');
      if(navEl) navEl.classList.toggle('menu-open',ham.classList.contains('open'));
      document.body.style.overflow=mp.classList.contains('show')?'hidden':'';
    });
    mp.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click',function(){mp.classList.remove('show');ham.classList.remove('open');if(navEl)navEl.classList.remove('menu-open');document.body.style.overflow=''});
    });
  }
})();
