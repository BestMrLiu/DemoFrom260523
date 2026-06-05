/**
 * 潮汐渔场 · Hero Canvas 海底动态视频模拟
 * Underwater scene: light rays + plankton + fish + wave distortion
 */
(function () {
  'use strict';

  var c = document.getElementById('heroCanvas2');
  if (!c) return;

  var ctx = c.getContext('2d');
  var w, h;
  var particles = [];
  var fish = [];
  var rays = [];
  var time = 0;

  function resize() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Light rays config
  for (var i = 0; i < 5; i++) {
    rays.push({
      x: w * (0.1 + Math.random() * 0.8),
      width: 60 + Math.random() * 120,
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Plankton / sediment particles
  for (var j = 0; j < 80; j++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 2.5,
      opacity: 0.05 + Math.random() * 0.25,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  // Fish
  function makeFish() {
    return {
      x: Math.random() * w,
      y: h * (0.2 + Math.random() * 0.5),
      size: 8 + Math.random() * 18,
      speed: 0.5 + Math.random() * 1.5,
      vy: (Math.random() - 0.5) * 0.8,
      wobble: Math.random() * Math.PI * 2,
      dir: Math.random() > 0.5 ? 1 : -1,
      opacity: 0.15 + Math.random() * 0.25,
    };
  }
  for (var k = 0; k < 15; k++) {
    fish.push(makeFish());
  }

  // Distant tiny fish school (background layer)
  var schoolFish = [];
  for (var sf = 0; sf < 30; sf++) {
    schoolFish.push({
      x: Math.random() * w,
      y: h * (0.3 + Math.random() * 0.4),
      size: 2 + Math.random() * 4,
      speed: 0.3 + Math.random() * 0.6,
      vy: (Math.random() - 0.5) * 0.4,
      wobble: Math.random() * Math.PI * 2,
      dir: Math.random() > 0.3 ? 1 : -1,
      opacity: 0.08 + Math.random() * 0.12,
    });
  }

  // Bioluminescent dots
  var bioDots = [];
  for (var bd = 0; bd < 25; bd++) {
    bioDots.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.8 + Math.random() * 2,
      pulse: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
      baseOpacity: 0.2 + Math.random() * 0.5,
    });
  }

  // Light caustics grid
  var causticNodes = [];
  for (var cn = 0; cn < 60; cn++) {
    causticNodes.push({
      x: Math.random() * w,
      y: h * 0.55 + Math.random() * h * 0.45,
      r: 20 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
    });
  }

  function drawRay(x, tWidth, alpha, sway) {
    var sx = x + Math.sin(time * 0.3 + sway) * 20;
    var grad = ctx.createLinearGradient(sx, 0, sx, h);
    grad.addColorStop(0, 'rgba(160,200,220,' + alpha + ')');
    grad.addColorStop(0.4, 'rgba(140,180,210,' + (alpha * 0.7) + ')');
    grad.addColorStop(1, 'rgba(60,100,140,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sx - tWidth * 0.8, 0);
    ctx.lineTo(sx - tWidth * 0.15, h);
    ctx.lineTo(sx + tWidth * 0.15, h);
    ctx.lineTo(sx + tWidth * 0.8, 0);
    ctx.closePath();
    ctx.fill();
  }

  function drawFish(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.dir, 1);

    var y = Math.sin(time * 1.5 + f.wobble) * 3;
    var s = f.size;
    var bodyShape = new Path2D();

    // Body — tapered bezier shape
    bodyShape.moveTo(s * 1.0, y);
    bodyShape.bezierCurveTo(s * 0.65, y - s * 0.42, -s * 0.3, y - s * 0.38, -s * 0.7, y - s * 0.06);
    bodyShape.bezierCurveTo(-s * 0.9, y + s * 0.01, -s * 0.3, y + s * 0.35, s * 0.65, y + s * 0.4);
    bodyShape.bezierCurveTo(s * 0.95, y + s * 0.26, s * 1.05, y + s * 0.04, s * 1.0, y);
    bodyShape.closePath();

    // Body fill with light-dark gradient for 3D look
    var bodyGrad = ctx.createLinearGradient(0, y - s * 0.4, 0, y + s * 0.4);
    bodyGrad.addColorStop(0, 'rgba(220,230,180,' + (f.opacity + 0.1) + ')');
    bodyGrad.addColorStop(0.35, 'rgba(255,220,155,' + (f.opacity + 0.18) + ')');
    bodyGrad.addColorStop(0.5, 'rgba(255,240,200,' + (f.opacity + 0.22) + ')');
    bodyGrad.addColorStop(0.65, 'rgba(255,200,140,' + (f.opacity + 0.15) + ')');
    bodyGrad.addColorStop(1, 'rgba(240,220,180,' + (f.opacity + 0.1) + ')');
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyShape);

    // Scale pattern — subtle horizontal arcs
    ctx.strokeStyle = 'rgba(255,255,255,' + (f.opacity * 0.3) + ')';
    ctx.lineWidth = s * 0.02;
    for (var si = -4; si <= 3; si++) {
      ctx.beginPath();
      ctx.arc(s * 0.05, y + si * s * 0.08, s * 0.42, -0.65, 0.65);
      ctx.stroke();
    }

    // Tail — indented fork
    ctx.fillStyle = 'rgba(255,180,120,' + (f.opacity + 0.12) + ')';
    ctx.beginPath();
    ctx.moveTo(-s * 0.65, y - s * 0.05);
    ctx.lineTo(-s * 1.3, y - s * 0.48);
    ctx.lineTo(-s * 0.88, y);
    ctx.lineTo(-s * 1.3, y + s * 0.48);
    ctx.lineTo(-s * 0.65, y + s * 0.05);
    ctx.closePath();
    ctx.fill();

    // Dorsal fin
    ctx.fillStyle = 'rgba(255,190,110,' + (f.opacity + 0.08) + ')';
    ctx.beginPath();
    ctx.moveTo(s * 0.25, y - s * 0.3);
    ctx.quadraticCurveTo(s * 0.35, y - s * 0.65, s * 0.02, y - s * 0.26);
    ctx.quadraticCurveTo(s * 0.05, y - s * 0.45, s * 0.2, y - s * 0.25);
    ctx.closePath();
    ctx.fill();

    // Pectoral fin
    ctx.beginPath();
    ctx.moveTo(s * 0.15, y + s * 0.02);
    ctx.quadraticCurveTo(s * 0.05, y + s * 0.4, -s * 0.12, y + s * 0.3);
    ctx.quadraticCurveTo(s * 0.0, y + s * 0.1, s * 0.15, y);
    ctx.closePath();
    ctx.fill();

    // Belly fin
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, y + s * 0.18);
    ctx.quadraticCurveTo(-s * 0.1, y + s * 0.42, -s * 0.3, y + s * 0.3);
    ctx.quadraticCurveTo(-s * 0.1, y + s * 0.15, -s * 0.05, y + s * 0.18);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(s * 0.45, y - s * 0.07, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(15,15,30,0.9)';
    ctx.beginPath();
    ctx.arc(s * 0.47, y - s * 0.07, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // Eye highlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(s * 0.49, y - s * 0.1, s * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Golden lateral line (大黄鱼 signature)
    ctx.strokeStyle = 'rgba(255,230,160,' + (f.opacity + 0.2) + ')';
    ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.moveTo(s * 0.65, y);
    ctx.quadraticCurveTo(s * 0.1, y - s * 0.01, -s * 0.55, y);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = 'rgba(200,140,100,' + (f.opacity + 0.1) + ')';
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.arc(s * 0.98, y - s * 0.03, s * 0.08, -0.5, 0.5);
    ctx.stroke();

    ctx.restore();
  }

  function draw() {
    // No background fill — hero image shows through naturally
    ctx.clearRect(0, 0, w, h);

    // Light rays
    for (var i = 0; i < rays.length; i++) {
      drawRay(rays[i].x, rays[i].width, rays[i].opacity, rays[i].phase);
    }

    // Particles
    for (var j = 0; j < particles.length; j++) {
      var p = particles[j];
      p.x += p.vx + Math.sin(time * 0.5 + p.wobble) * 0.2;
      p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      ctx.fillStyle = 'rgba(200,220,240,' + p.opacity + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fish
    for (var k = 0; k < fish.length; k++) {
      var f = fish[k];
      f.x += f.speed * f.dir;
      f.y += f.vy + Math.sin(time + f.wobble) * 0.3;
      if (f.dir > 0 && f.x > w + 50) { f.x = -50; f.y = h * (0.2 + Math.random() * 0.5); }
      if (f.dir < 0 && f.x < -50) { f.x = w + 50; f.y = h * (0.2 + Math.random() * 0.5); }
      drawFish(f);
    }

    // Distant school fish
    for (var sf = 0; sf < schoolFish.length; sf++) {
      var sff = schoolFish[sf];
      sff.x += sff.speed * sff.dir;
      sff.y += sff.vy;
      if (sff.dir > 0 && sff.x > w + 20) { sff.x = -20; }
      if (sff.dir < 0 && sff.x < -20) { sff.x = w + 20; }
      ctx.fillStyle = 'rgba(180,200,220,' + sff.opacity + ')';
      ctx.beginPath();
      ctx.ellipse(sff.x, sff.y, sff.size, sff.size * 0.5, -0.1 * sff.dir, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bioluminescent dots
    for (var bd = 0; bd < bioDots.length; bd++) {
      var bio = bioDots[bd];
      bio.y -= bio.speed;
      bio.x += Math.sin(time * 2 + bio.pulse) * 0.3;
      if (bio.y < -10) { bio.y = h + 10; bio.x = Math.random() * w; }
      var glow = bio.baseOpacity + Math.sin(time * 3 + bio.pulse) * 0.2;
      ctx.fillStyle = 'rgba(180,220,255,' + glow + ')';
      ctx.beginPath();
      ctx.arc(bio.x, bio.y, bio.r, 0, Math.PI * 2);
      ctx.fill();
      // Glow halo
      var haloGrad = ctx.createRadialGradient(bio.x, bio.y, 0, bio.x, bio.y, bio.r * 3);
      haloGrad.addColorStop(0, 'rgba(180,220,255,' + (glow * 0.4) + ')');
      haloGrad.addColorStop(1, 'rgba(180,220,255,0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(bio.x, bio.y, bio.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Light caustics on bottom
    for (var cn = 0; cn < causticNodes.length; cn++) {
      var cau = causticNodes[cn];
      var cx = cau.x + Math.sin(time * cau.speed * 0.5 + cau.phase) * 40;
      var cy = cau.y + Math.cos(time * cau.speed * 0.7 + cau.phase) * 20;
      var alpha = 0.03 + Math.sin(time * cau.speed + cau.phase) * 0.02;
      var causticGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cau.r);
      causticGrad.addColorStop(0, 'rgba(140,200,230,' + Math.max(0, alpha) + ')');
      causticGrad.addColorStop(1, 'rgba(140,200,230,0)');
      ctx.fillStyle = causticGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, cau.r, cau.r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bottom fade for text readability
    var bottomGrad = ctx.createLinearGradient(0, h * 0.4, 0, h);
    bottomGrad.addColorStop(0, 'rgba(10,30,48,0)');
    bottomGrad.addColorStop(0.5, 'rgba(8,22,38,0.4)');
    bottomGrad.addColorStop(1, 'rgba(6,18,32,0.85)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    time += 0.016;
    requestAnimationFrame(draw);
  }

  draw();
})();
