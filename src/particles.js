// High-Performance Physics Particle and Confetti Engine for Canvas 16:9

export class ParticleSystem {
  constructor(width = 1920, height = 1080) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.confettiPieces = [];
    this.shockwaves = [];
    this.ambientStars = [];

    // Pre-seed ambient dust
    this.initAmbientStars(80);
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  initAmbientStars(count) {
    this.ambientStars = [];
    for (let i = 0; i < count; i++) {
      this.ambientStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        speed: 0.2 + Math.random() * 0.4,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  clear() {
    this.particles = [];
    this.confettiPieces = [];
    this.shockwaves = [];
  }

  // Shockwave ring explosion
  addShockwave(x, y, color = '#ffd700', maxRadius = 800) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      color,
      lineWidth: 18,
      alpha: 1.0,
      decay: 0.022
    });
  }

  // Firework burst (Rank reveals)
  burstFireworks(x, y, count = 120, palette = ['#ffd700', '#ffea00', '#ff9100', '#ffffff']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 16;
      const color = palette[Math.floor(Math.random() * palette.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 5,
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.02,
        gravity: 0.22,
        drag: 0.96,
        sparkle: Math.random() > 0.4
      });
    }
  }

  // Confetti Cannon / Rain
  addConfetti(count = 200, goldOnly = false) {
    const goldPalette = ['#ffd700', '#fff099', '#f39c12', '#e67e22', '#ffffff', '#e5c158'];
    const vibrantPalette = [
      '#ffd700', '#ff2a6d', '#05d9e8', '#00ff66', '#d6249f', '#ffb703',
      '#ffffff', '#8338ec', '#3a86ff'
    ];
    const palette = goldOnly ? goldPalette : vibrantPalette;

    for (let i = 0; i < count; i++) {
      const isRibbon = Math.random() > 0.5;
      this.confettiPieces.push({
        x: Math.random() * this.width,
        y: -30 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 6,
        vy: 3 + Math.random() * 7,
        w: isRibbon ? 6 + Math.random() * 6 : 10 + Math.random() * 12,
        h: isRibbon ? 24 + Math.random() * 28 : 10 + Math.random() * 12,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        flipSpeed: (Math.random() - 0.5) * 0.2,
        flipAngle: Math.random() * Math.PI,
        color: palette[Math.floor(Math.random() * palette.length)],
        isRibbon,
        alpha: 1.0
      });
    }
  }

  // Continuous rain for grand finale
  spawnCelebrationShower(intensity = 6, goldOnly = false) {
    this.addConfetti(intensity, goldOnly);
  }

  update(dt = 1) {
    // Update ambient stars
    for (let star of this.ambientStars) {
      star.y -= star.speed * dt;
      if (star.y < -10) star.y = this.height + 10;
      star.twinkleOffset += star.twinkleSpeed * dt;
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.12 * dt;
      sw.alpha -= sw.decay * dt;
      sw.lineWidth = Math.max(1, sw.lineWidth * 0.96);
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius * 0.98) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update particles (fireworks / sparkles)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity * dt;
      p.alpha -= p.decay * dt;

      if (p.sparkle) {
        p.size = Math.max(1, p.size + (Math.random() - 0.5) * 1.5);
      }

      if (p.alpha <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
      }
    }

    // Update confetti
    for (let i = this.confettiPieces.length - 1; i >= 0; i--) {
      const c = this.confettiPieces[i];
      c.x += c.vx * dt + Math.sin(c.y * 0.02) * 1.5;
      c.y += c.vy * dt;
      c.rotation += c.rotSpeed * dt;
      c.flipAngle += c.flipSpeed * dt;

      if (c.y > this.height + 60) {
        this.confettiPieces.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Render Ambient Floating Dust / Stars
    for (let star of this.ambientStars) {
      const currentAlpha = Math.max(0.1, star.alpha + Math.sin(star.twinkleOffset) * 0.3);
      ctx.fillStyle = `rgba(255, 235, 180, ${currentAlpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Render Shockwaves
    for (let sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = sw.lineWidth;
      ctx.strokeStyle = sw.color;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Render Particles / Sparkles
    for (let p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Render 3D Foil Confetti
    for (let c of this.confettiPieces) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      const scaleY = Math.cos(c.flipAngle);
      ctx.scale(1, scaleY);

      ctx.fillStyle = c.color;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 8;

      if (c.isRibbon) {
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      } else {
        // Metallic polygon shard
        ctx.beginPath();
        ctx.moveTo(-c.w / 2, -c.h / 2);
        ctx.lineTo(c.w / 2, -c.h / 4);
        ctx.lineTo(c.w / 3, c.h / 2);
        ctx.lineTo(-c.w / 2, c.h / 3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }
}
