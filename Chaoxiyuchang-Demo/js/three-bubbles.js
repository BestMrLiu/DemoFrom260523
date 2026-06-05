/**
 * 官井洋渔场 — Hero Underwater Bubble Particles
 * Three.js subtle floating bubbles in the hero background
 */
(function () {
  'use strict';

  var container = document.getElementById('heroCanvas');
  if (!container || typeof THREE === 'undefined') return;

  var w = window.innerWidth;
  var h = window.innerHeight;
  if (w < 640) return; // skip on small phones

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.z = 15;

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Bubbles
  var bubbles = [];
  var geom = new THREE.SphereGeometry(1, 8, 8);
  for (var i = 0; i < 40; i++) {
    var scale = 0.03 + Math.random() * 0.12;
    var mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08 + Math.random() * 0.15,
    });
    var bubble = new THREE.Mesh(geom, mat);
    bubble.scale.set(scale, scale, scale);
    bubble.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 12,
      Math.random() * 8 - 4
    );
    bubble.userData = {
      speed: 0.3 + Math.random() * 0.8,
      sway: 0.2 + Math.random() * 0.6,
      offset: Math.random() * Math.PI * 2,
      baseX: bubble.position.x,
    };
    scene.add(bubble);
    bubbles.push(bubble);
  }

  // Subtle light rays (elongated planes)
  var rayGeom = new THREE.PlaneGeometry(0.3, 8);
  var rays = [];
  for (var j = 0; j < 6; j++) {
    var rayMat = new THREE.MeshBasicMaterial({
      color: 0x4799C8,
      transparent: true,
      opacity: 0.03 + Math.random() * 0.04,
      side: THREE.DoubleSide,
    });
    var ray = new THREE.Mesh(rayGeom, rayMat);
    ray.position.set((Math.random()-0.5)*10, (Math.random()-0.5)*6, -5 + Math.random()*2);
    ray.rotation.z = Math.random() * 0.3;
    ray.userData = { speed: 0.05 + Math.random()*0.1, offset: Math.random()*Math.PI*2 };
    scene.add(ray);
    rays.push(ray);
  }

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.position.y += b.userData.speed * 0.01;
      b.position.x = b.userData.baseX + Math.sin(t * 0.5 + b.userData.offset) * b.userData.sway;
      if (b.position.y > 7) { b.position.y = -7; b.position.x = (Math.random()-0.5)*20; }
    }

    for (var j = 0; j < rays.length; j++) {
      rays[j].material.opacity = 0.03 + Math.sin(t * rays[j].userData.speed + rays[j].userData.offset) * 0.02;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    w = window.innerWidth; h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
