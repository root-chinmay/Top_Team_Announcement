// 16:9 Cinematic Video Engine for Top Winners Announcement
import { ParticleSystem } from './particles.js';
import { soundEngine } from './audio.js';

export class VideoEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 1920;
    this.height = 1080;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.particles = new ParticleSystem(this.width, this.height);

    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 26; // Calculated dynamically
    this.rafId = null;
    this.lastTimestamp = 0;

    // Data model
    this.eventTitle = "GLOBAL INNOVATION HACKATHON 2026";
    this.eventSubtitle = "GRAND FINALE AWARDS CEREMONY";
    this.winnerCount = 3;
    this.teams = [
      { rank: 3, name: "NeuralForge AI", tagline: "Autonomous Multi-Agent Systems" },
      { rank: 2, name: "QuantumLeap", tagline: "Sub-atomic Encryption Protocol" },
      { rank: 1, name: "CyberTitans", tagline: "Revolutionary Generative Robotics" }
    ];

    // Theme: 'gold' | 'cyber' | 'esports'
    this.theme = 'gold';

    // Timeline triggers for audio and special fx
    this.sceneSchedule = [];
    this.firedEvents = new Set();

    // Camera shake
    this.shakeAmount = 0;

    // Callbacks
    this.onTimeUpdate = null;
    this.onStateChange = null;

    // MediaRecorder
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  setData({ eventTitle, eventSubtitle, winnerCount, teams, theme = 'gold' }) {
    if (eventTitle) this.eventTitle = eventTitle.toUpperCase();
    if (eventSubtitle) this.eventSubtitle = eventSubtitle.toUpperCase();
    this.winnerCount = parseInt(winnerCount, 10);
    this.teams = teams;
    this.theme = theme;

    this.calculateSchedule();
    this.seek(0);
  }

  calculateSchedule() {
    this.sceneSchedule = [];
    this.firedEvents.clear();

    let t = 0;
    // Scene 0: Epic Intro (Opening Sting)
    const introDuration = 3.5;
    this.sceneSchedule.push({
      type: 'intro',
      start: t,
      end: t + introDuration,
      label: 'Grand Opening'
    });
    t += introDuration;

    // Reveal order: from lowest rank up to 2nd
    // teams array is sorted descending: N, N-1, ... 2, 1
    const sortedTeams = [...this.teams].sort((a, b) => b.rank - a.rank);

    // Filter non-1st place teams first
    const runnerUps = sortedTeams.filter(team => team.rank > 1);
    const champion = sortedTeams.find(team => team.rank === 1) || sortedTeams[0];

    // Every team announcement has:
    // 1. A 3-second visual countdown timer shown on screen
    // 2. A 10-second team reveal display
    const countdownDuration = 3.0;
    const teamRevealDuration = 10.0;

    for (let team of runnerUps) {
      // 3-Second Countdown Scene before declaring team
      this.sceneSchedule.push({
        type: 'countdown',
        rank: team.rank,
        isChampion: false,
        start: t,
        end: t + countdownDuration,
        label: `⏳ ${this.getRankOrdinal(team.rank)} (3s)`
      });
      t += countdownDuration;

      // 10-Second Team Name Announcement Scene
      this.sceneSchedule.push({
        type: 'rank',
        rank: team.rank,
        team: team,
        start: t,
        end: t + teamRevealDuration,
        label: `${this.getRankOrdinal(team.rank)} Place`
      });
      t += teamRevealDuration;
    }

    // 1st Place Grand Champion 3-Second Countdown
    this.sceneSchedule.push({
      type: 'champion_countdown',
      rank: 1,
      isChampion: true,
      start: t,
      end: t + countdownDuration,
      label: '⏳ Champion (3s)'
    });
    t += countdownDuration;

    // 1st Place Grand Champion 10-Second Climax Reveal
    this.sceneSchedule.push({
      type: 'champion',
      rank: 1,
      team: champion,
      start: t,
      end: t + teamRevealDuration,
      label: '🏆 1st Place Champion'
    });
    t += teamRevealDuration;

    // Grand Podium / Leaderboard Outro
    const outroDuration = 6.0;
    this.sceneSchedule.push({
      type: 'podium',
      start: t,
      end: t + outroDuration,
      label: 'Podium & Leaderboard'
    });
    t += outroDuration;

    this.duration = t;
  }

  getRankOrdinal(rank) {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return `${rank}th`;
  }

  play() {
    soundEngine.ensureContext();
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    if (this.currentTime >= this.duration) {
      this.currentTime = 0;
      this.firedEvents.clear();
      this.particles.clear();
    }
    this.loop(this.lastTimestamp);
    if (this.onStateChange) this.onStateChange(true);
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.onStateChange) this.onStateChange(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(timeInSeconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, timeInSeconds));

    // Reset fired events that are after currentTime
    for (let eventId of Array.from(this.firedEvents)) {
      const match = eventId.match(/@([\d.]+)/);
      if (match && parseFloat(match[1]) > this.currentTime) {
        this.firedEvents.delete(eventId);
      }
    }

    this.renderFrame(this.currentTime);
    if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
  }

  loop(timestamp) {
    if (!this.isPlaying) return;

    const delta = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    this.currentTime += delta;

    if (this.currentTime >= this.duration) {
      this.currentTime = this.duration;
      this.renderFrame(this.currentTime);
      this.pause();
      if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
      return;
    }

    this.renderFrame(this.currentTime);
    if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);

    this.rafId = requestAnimationFrame((ts) => this.loop(ts));
  }

  // Check and trigger sound/visual events based on current time
  checkAudioEvents(t) {
    for (let scene of this.sceneSchedule) {
      // 3-Second Countdown Audio Ticks (3, 2, 1) and tension
      if (scene.type === 'countdown' || scene.type === 'champion_countdown') {
        const tick3Key = `tick3_${scene.start.toFixed(2)}`;
        const tick2Key = `tick2_${scene.start.toFixed(2)}`;
        const tick1Key = `tick1_${scene.start.toFixed(2)}`;
        const whooshKey = `whoosh_${scene.start.toFixed(2)}`;

        if (t >= scene.start && !this.firedEvents.has(tick3Key)) {
          this.firedEvents.add(tick3Key);
          soundEngine.playCountdownTick(3);
          if (scene.type === 'champion_countdown') {
            soundEngine.playDrumroll(2.8);
          }
        }
        if (t >= scene.start + 1.0 && !this.firedEvents.has(tick2Key)) {
          this.firedEvents.add(tick2Key);
          soundEngine.playCountdownTick(2);
        }
        if (t >= scene.start + 2.0 && !this.firedEvents.has(tick1Key)) {
          this.firedEvents.add(tick1Key);
          soundEngine.playCountdownTick(1);
        }
        if (t >= scene.start + 2.4 && !this.firedEvents.has(whooshKey)) {
          this.firedEvents.add(whooshKey);
          soundEngine.playWhoosh(0.7);
        }
      }

      // Reveal sound & visual triggers
      const revealKey = `reveal_${scene.type}_${scene.rank || 0}@${scene.start.toFixed(2)}`;
      if (t >= scene.start && !this.firedEvents.has(revealKey)) {
        this.firedEvents.add(revealKey);

        if (scene.type === 'intro') {
          soundEngine.playBoom(1.0);
          soundEngine.playWhoosh(1.4);
          this.particles.addShockwave(this.width / 2, this.height / 2, '#ffd700', 900);
        } else if (scene.type === 'rank') {
          soundEngine.playRankRevealChord(scene.rank);
          this.shakeAmount = 14;
          this.particles.addShockwave(this.width / 2, this.height / 2, this.getRankColor(scene.rank).primary, 850);
          this.particles.burstFireworks(this.width / 2, this.height / 2 - 40, 90, [
            this.getRankColor(scene.rank).primary,
            this.getRankColor(scene.rank).secondary,
            '#ffffff'
          ]);
          this.particles.addConfetti(60, scene.rank === 1);
        } else if (scene.type === 'champion') {
          soundEngine.playChampionFanfare();
          this.shakeAmount = 28; // Massive screen shake
          this.particles.addShockwave(this.width / 2, this.height / 2, '#ffd700', 1200);
          this.particles.burstFireworks(this.width / 2, this.height / 2 - 60, 220, [
            '#ffd700', '#fff59d', '#ffab00', '#ffffff'
          ]);
          this.particles.burstFireworks(this.width * 0.25, this.height * 0.35, 120, ['#ffd700', '#ff6d00']);
          this.particles.burstFireworks(this.width * 0.75, this.height * 0.35, 120, ['#ffd700', '#00e5ff']);
          this.particles.addConfetti(260, true);
        } else if (scene.type === 'podium') {
          soundEngine.playBoom(1.1);
          soundEngine.playSparkle();
          soundEngine.playApplause(3.5, 0.5);
          this.particles.addConfetti(180, false);
        }
      }

      // Continuous confetti for champion & podium scenes
      if ((scene.type === 'champion' || scene.type === 'podium') && t >= scene.start && t <= scene.end) {
        if (Math.random() < 0.3) {
          this.particles.spawnCelebrationShower(3, scene.type === 'champion');
        }
      }
    }
  }

  getRankColor(rank) {
    if (rank === 1) {
      return {
        primary: '#ffd700',
        secondary: '#ff9100',
        light: '#fff9c4',
        glow: 'rgba(255, 215, 0, 0.65)',
        name: 'GOLD CHAMPION'
      };
    }
    if (rank === 2) {
      return {
        primary: '#e0e0e0',
        secondary: '#90a4ae',
        light: '#ffffff',
        glow: 'rgba(224, 224, 224, 0.6)',
        name: 'SILVER RUNNER-UP'
      };
    }
    if (rank === 3) {
      return {
        primary: '#cd7f32',
        secondary: '#8d4925',
        light: '#ffe0b2',
        glow: 'rgba(205, 127, 50, 0.6)',
        name: 'BRONZE 3RD PLACE'
      };
    }
    if (rank === 4) {
      return {
        primary: '#8c52ff',
        secondary: '#5e17eb',
        light: '#e1d4ff',
        glow: 'rgba(140, 82, 255, 0.55)',
        name: '4TH PLACE'
      };
    }
    return {
      primary: '#00e5ff',
      secondary: '#00838f',
      light: '#b2ebf2',
      glow: 'rgba(0, 229, 255, 0.55)',
      name: '5TH PLACE'
    };
  }

  // Master Render Frame
  renderFrame(time) {
    this.checkAudioEvents(time);

    const ctx = this.ctx;
    ctx.save();

    // Camera rumble / screen shake
    if (this.shakeAmount > 0.1) {
      const offsetX = (Math.random() - 0.5) * this.shakeAmount;
      const offsetY = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(offsetX, offsetY);
      this.shakeAmount *= 0.91; // smooth decay
    }

    // 1. Render Cinematic Stadium / Studio Background
    this.renderBackground(time);

    // 2. Render Volumetric Moving Spotlights
    this.renderSpotlights(time);

    // 3. Update & Render Particle Dust & Confetti
    this.particles.update(1.0);
    this.particles.render(ctx);

    // 4. Determine Active Scene and Render Scene Content
    const activeScene = this.sceneSchedule.find(s => time >= s.start && time < s.end) 
      || this.sceneSchedule[this.sceneSchedule.length - 1];

    if (activeScene) {
      const sceneProgress = (time - activeScene.start) / (activeScene.end - activeScene.start);

      switch (activeScene.type) {
        case 'intro':
          this.renderIntroScene(sceneProgress, time);
          break;
        case 'countdown':
        case 'champion_countdown':
          this.renderCountdownScene(activeScene.rank, activeScene.isChampion, sceneProgress, time);
          break;
        case 'rank':
          this.renderRankScene(activeScene.team, activeScene.rank, sceneProgress, time);
          break;
        case 'champion':
          this.renderChampionScene(activeScene.team, sceneProgress, time);
          break;
        case 'podium':
          this.renderPodiumScene(sceneProgress, time);
          break;
      }
    }

    // 5. Render Cinematic Letterbox & Vignette Overlay
    this.renderCinematicOverlay(time);

    ctx.restore();
  }

  renderBackground(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Deep dynamic gradient
    const bgGrad = ctx.createRadialGradient(
      w / 2, h / 2, 50,
      w / 2, h / 2, w * 0.75
    );

    if (this.theme === 'cyber') {
      bgGrad.addColorStop(0, '#0a0e27');
      bgGrad.addColorStop(0.6, '#060814');
      bgGrad.addColorStop(1, '#020307');
    } else if (this.theme === 'esports') {
      bgGrad.addColorStop(0, '#2b0914');
      bgGrad.addColorStop(0.6, '#130408');
      bgGrad.addColorStop(1, '#050102');
    } else {
      // Midnight Gold & Obsidian
      bgGrad.addColorStop(0, '#1c1508');
      bgGrad.addColorStop(0.5, '#0e0b04');
      bgGrad.addColorStop(1, '#050402');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle perspective stage grid on floor
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.04)';
    ctx.lineWidth = 1.5;
    const horizon = h * 0.72;

    // Horizon line
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();

    // Perspective floor lines
    const numLines = 18;
    for (let i = 0; i <= numLines; i++) {
      const bottomX = (w / numLines) * i;
      ctx.beginPath();
      ctx.moveTo(w / 2, horizon);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderSpotlights(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 4 cinematic volumetric lights
    const lights = [
      { topX: w * 0.1, speed: 0.6, baseAngle: 0.45, color: 'rgba(255, 220, 120, 0.08)' },
      { topX: w * 0.35, speed: 0.9, baseAngle: 0.2, color: 'rgba(255, 255, 255, 0.06)' },
      { topX: w * 0.65, speed: -0.85, baseAngle: -0.2, color: 'rgba(255, 255, 255, 0.06)' },
      { topX: w * 0.9, speed: -0.65, baseAngle: -0.45, color: 'rgba(255, 220, 120, 0.08)' }
    ];

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let light of lights) {
      const sway = Math.sin(time * light.speed) * 0.25;
      const angle = light.baseAngle + sway;

      const beamLength = h * 1.3;
      const targetX = light.topX + Math.sin(angle) * beamLength;
      const targetY = h;

      const grad = ctx.createLinearGradient(light.topX, 0, targetX, targetY);
      grad.addColorStop(0, light.color.replace('0.08', '0.22').replace('0.06', '0.18'));
      grad.addColorStop(0.7, light.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(light.topX - 35, 0);
      ctx.lineTo(light.topX + 35, 0);
      ctx.lineTo(targetX + 280, targetY);
      ctx.lineTo(targetX - 280, targetY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // Scene 0: Epic Intro
  renderIntroScene(progress, time) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    const scale = 0.9 + Math.min(progress * 0.15, 0.15);
    const alpha = progress < 0.15 ? progress / 0.15 : (progress > 0.85 ? (1 - progress) / 0.15 : 1.0);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Glowing Top Badge
    ctx.textAlign = 'center';
    ctx.font = '700 24px "Orbitron", "Montserrat", sans-serif';
    ctx.fillStyle = '#ffb300';
    ctx.letterSpacing = '8px';
    ctx.shadowColor = '#ffb300';
    ctx.shadowBlur = 15;
    ctx.fillText("★ OFFICIAL CEREMONY ★", 0, -140);

    // Event Main Title (3D Gold Extrusion)
    ctx.font = '900 68px "Syne", "Montserrat", sans-serif';
    ctx.letterSpacing = '4px';

    // Shadow layers for depth
    ctx.fillStyle = '#5c4300';
    ctx.fillText(this.eventTitle, 4, -46);
    ctx.fillStyle = '#8f6800';
    ctx.fillText(this.eventTitle, 2, -48);

    // Front gradient
    const titleGrad = ctx.createLinearGradient(-400, -100, 400, 0);
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.35, '#ffecb3');
    titleGrad.addColorStop(0.65, '#ffd700');
    titleGrad.addColorStop(1, '#ff8f00');

    ctx.fillStyle = titleGrad;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 35;
    ctx.fillText(this.eventTitle, 0, -50);

    // Horizontal Accent Dividers
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-320, 0);
    ctx.lineTo(320, 0);
    ctx.stroke();

    // Event Subtitle
    ctx.font = '600 28px "Outfit", "Inter", sans-serif';
    ctx.fillStyle = '#e0e0e0';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.letterSpacing = '6px';
    ctx.fillText(this.eventSubtitle, 0, 50);

    // Pulsing Countdown Hook
    const pulse = 1 + Math.sin(time * 6) * 0.05;
    ctx.scale(pulse, pulse);
    ctx.font = '800 32px "Orbitron", sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 20;
    ctx.letterSpacing = '5px';
    ctx.fillText("ANNOUNCING THE TOP WINNERS", 0, 130);

    ctx.restore();
  }

  // Scene for 5th, 4th, 3rd, 2nd Place Reveals
  renderRankScene(team, rank, progress, time) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    const rankInfo = this.getRankColor(rank);

    // 10-second display: entrance (first 0.6s), steady readable name (8.8s), exit fade (last 0.6s)
    const enterTime = 0.06;
    const exitTime = 0.94;
    let animProgress = 1.0;
    let alpha = 1.0;

    if (progress < enterTime) {
      const p = progress / enterTime;
      animProgress = Math.sin((p * Math.PI) / 2); // smooth ease
      alpha = p;
    } else if (progress > exitTime) {
      alpha = 1 - (progress - exitTime) / (1 - exitTime);
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Dynamic Entrance Scale & Slide
    const scale = 0.85 + animProgress * 0.15;
    ctx.translate(cx, cy + (1 - animProgress) * 50);
    ctx.scale(scale, scale);

    // 1. Render Medal / Trophy Visual
    this.renderRankMedal(0, -170, rank, time);

    // 2. Rank Title Badge (e.g. "3RD PLACE", "2ND PLACE")
    ctx.textAlign = 'center';
    ctx.font = '800 36px "Orbitron", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = rankInfo.primary;
    ctx.shadowColor = rankInfo.glow;
    ctx.shadowBlur = 25;
    ctx.fillText(`${this.getRankOrdinal(rank)} PLACE`, 0, -40);

    // 3. TEAM NAME — Large, Centered, and Crystal Clear (Displayed for 10s)
    ctx.font = '900 82px "Syne", "Montserrat", sans-serif';
    ctx.letterSpacing = '2px';

    // 3D Shadow extrusion
    ctx.fillStyle = '#000000';
    ctx.fillText(team.name, 5, 55);
    ctx.fillStyle = rankInfo.secondary;
    ctx.fillText(team.name, 2, 52);

    // Front gradient
    const nameGrad = ctx.createLinearGradient(-350, 0, 350, 50);
    nameGrad.addColorStop(0, rankInfo.light);
    nameGrad.addColorStop(0.5, rankInfo.primary);
    nameGrad.addColorStop(1, rankInfo.secondary);

    ctx.fillStyle = nameGrad;
    ctx.shadowColor = rankInfo.glow;
    ctx.shadowBlur = 40;
    ctx.fillText(team.name, 0, 50);

    // 4. Team Project / Tagline (if present)
    if (team.tagline) {
      ctx.font = '500 26px "Outfit", sans-serif';
      ctx.fillStyle = '#d0d8e2';
      ctx.letterSpacing = '4px';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText(team.tagline, 0, 115);
    }

    // 5. Decorative Rank Framing Lines
    ctx.strokeStyle = rankInfo.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(-240, 160);
    ctx.lineTo(240, 160);
    ctx.stroke();

    ctx.restore();
  }

  // 3-SECOND VISUAL COUNTDOWN SHOWN ON SCREEN BEFORE REVEALING EACH TEAM
  renderCountdownScene(rank, isChampion, progress, time) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    const ordinal = this.getRankOrdinal(rank);
    const rankInfo = this.getRankColor(rank);
    const accentColor = isChampion ? '#ffd700' : rankInfo.primary;

    ctx.save();

    // Cinematic background glow
    const glowGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 650);
    if (isChampion) {
      glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.22)');
      glowGrad.addColorStop(0.5, 'rgba(30, 20, 4, 0.65)');
      glowGrad.addColorStop(1, 'rgba(5, 4, 2, 0.95)');
    } else {
      glowGrad.addColorStop(0, 'rgba(0, 242, 254, 0.16)');
      glowGrad.addColorStop(0.5, 'rgba(8, 14, 26, 0.65)');
      glowGrad.addColorStop(1, 'rgba(3, 4, 10, 0.95)');
    }
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Calculate countdown second: 3, 2, 1
    const elapsedSec = Math.min(2.99, progress * 3.0);
    const currentNum = 3 - Math.floor(elapsedSec); // 3, 2, 1
    const secondFraction = elapsedSec - Math.floor(elapsedSec); // 0 to 1

    // Scale pop on each second tick
    const numScale = 1.0 + Math.max(0, 1 - secondFraction * 2.4) * 0.4;

    // 1. Top HUD Category Pill
    ctx.textAlign = 'center';
    ctx.font = '800 22px "Orbitron", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 18;
    ctx.fillText(isChampion ? "★ GRAND CHAMPION ANNOUNCEMENT ★" : "★ UPCOMING WINNER REVEAL ★", cx, cy - 220);

    // 2. Main Announcement Label
    ctx.font = '900 46px "Syne", "Montserrat", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 25;
    const announceLabel = isChampion ? "ANNOUNCING 1ST PLACE" : `ANNOUNCING ${ordinal} PLACE`;
    ctx.fillText(announceLabel, cx, cy - 160);

    // 3. Central Circular Countdown Gauge
    const clockY = cy + 25;
    const clockRadius = 115;

    // Background Circle Track
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, clockY, clockRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Animated Circular Arc Progress (Sweeps 360 degrees over 3 seconds)
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 35;

    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const sweepAngle = (1 - progress) * (Math.PI * 2);
    ctx.arc(cx, clockY, clockRadius, startAngle, startAngle + sweepAngle, false);
    ctx.stroke();

    // Sonar pulse ring on each second
    const pulseRadius = clockRadius + secondFraction * 65;
    const pulseAlpha = Math.max(0, (1 - secondFraction) * 0.7);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.globalAlpha = pulseAlpha;
    ctx.beginPath();
    ctx.arc(cx, clockY, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 4. Large Bold Number in Center (3, 2, 1)
    ctx.save();
    ctx.translate(cx, clockY);
    ctx.scale(numScale, numScale);

    ctx.font = '900 130px "Orbitron", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 45;
    ctx.fillText(`${currentNum}`, 0, 6);

    ctx.restore();

    // 5. Bottom Urgency Prompt
    ctx.font = '700 20px "Orbitron", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.fillText("PREPARE FOR THE REVEAL", cx, cy + 215);

    ctx.restore();
  }

  // 1ST PLACE GRAND CHAMPION — THE MOST DRAMATIC AND SPECTACULAR REVEAL (10 SECONDS)
  renderChampionScene(team, progress, time) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    const enterTime = 0.06;
    const exitTime = 0.94;
    let animProgress = 1.0;
    let alpha = 1.0;

    if (progress < enterTime) {
      animProgress = progress / enterTime;
      alpha = animProgress;
    } else if (progress > exitTime) {
      alpha = 1 - (progress - exitTime) / (1 - exitTime);
    }

    ctx.save();

    // Radiating Golden Sunburst Rays behind trophy
    ctx.save();
    ctx.translate(cx, cy - 130);
    ctx.rotate(time * 0.35); // Slow majestic rotation
    const numRays = 24;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.07)';
    for (let i = 0; i < numRays; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const angle1 = (i / numRays) * Math.PI * 2;
      const angle2 = angle1 + Math.PI / numRays;
      ctx.arc(0, 0, 850, angle1, angle2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Dynamic Entrance Scale
    const scale = 0.8 + animProgress * 0.2;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // 1. Grand 3D Golden Trophy Visual
    this.renderGrandChampionTrophy(0, -170, time);

    // 2. Champion Crown Banner
    ctx.textAlign = 'center';
    ctx.font = '900 38px "Orbitron", sans-serif';
    ctx.letterSpacing = '10px';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 35;
    ctx.fillText("👑 GRAND CHAMPION 👑", 0, -40);

    ctx.font = '700 24px "Orbitron", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = '#fff59d';
    ctx.shadowColor = '#ffe082';
    ctx.shadowBlur = 15;
    ctx.fillText("1ST PLACE WINNER", 0, -5);

    // 3. TEAM NAME — Massive, Radiant, Chrome Gold
    ctx.font = '900 100px "Syne", "Montserrat", sans-serif';
    ctx.letterSpacing = '3px';

    // 3D Bevel Extrusion
    for (let depth = 8; depth >= 1; depth--) {
      ctx.fillStyle = depth > 4 ? '#3e2723' : '#b78103';
      ctx.fillText(team.name, depth, 90 + depth);
    }

    // Front Chrome Gold Gradient
    const goldGrad = ctx.createLinearGradient(-400, 20, 400, 110);
    goldGrad.addColorStop(0, '#ffffff');
    goldGrad.addColorStop(0.2, '#fff176');
    goldGrad.addColorStop(0.5, '#ffd700');
    goldGrad.addColorStop(0.8, '#ff8f00');
    goldGrad.addColorStop(1, '#ff6f00');

    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
    ctx.shadowBlur = 50;
    ctx.fillText(team.name, 0, 90);

    // 4. Team Tagline
    if (team.tagline) {
      ctx.font = '600 28px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.letterSpacing = '5px';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 12;
      ctx.fillText(team.tagline, 0, 155);
    }

    // 5. Champion Ribbon Trim
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(-360, 200);
    ctx.lineTo(360, 200);
    ctx.stroke();

    ctx.font = '700 20px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffe082';
    ctx.letterSpacing = '6px';
    ctx.fillText("★ VICTORY & SUPREME EXCELLENCE ★", 0, 235);

    ctx.restore();
  }

  // Grand Finale / Podium Overview Scene
  renderPodiumScene(progress, time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.textAlign = 'center';

    // Header Title
    ctx.font = '900 44px "Syne", "Montserrat", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 25;
    ctx.fillText("HONORING ALL TOP WINNERS", w / 2, 140);

    ctx.font = '600 22px "Outfit", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.letterSpacing = '5px';
    ctx.fillText(this.eventTitle, w / 2, 180);

    // Render Podium blocks based on winner count
    const sortedTeams = [...this.teams].sort((a, b) => a.rank - b.rank); // 1, 2, 3, 4, 5
    const count = sortedTeams.length;

    if (count <= 5) {
      // Podium Layout order for up to 5 teams
      let displayOrder = [];
      if (count === 1) {
        displayOrder = [sortedTeams[0]];
      } else if (count === 2) {
        displayOrder = [sortedTeams[1], sortedTeams[0]]; // 2nd, 1st
      } else if (count === 3) {
        displayOrder = [sortedTeams[1], sortedTeams[0], sortedTeams[2]]; // 2nd, 1st, 3rd
      } else if (count === 4) {
        displayOrder = [sortedTeams[3], sortedTeams[1], sortedTeams[0], sortedTeams[2]]; // 4th, 2nd, 1st, 3rd
      } else {
        // 5 teams: 4th, 2nd, 1st, 3rd, 5th
        displayOrder = [
          sortedTeams[3],
          sortedTeams[1],
          sortedTeams[0],
          sortedTeams[2],
          sortedTeams[4]
        ].filter(Boolean);
      }

      const totalCols = displayOrder.length;
      const colWidth = Math.min(260, (w * 0.85) / totalCols);
      const startX = (w - (totalCols * colWidth + (totalCols - 1) * 30)) / 2 + colWidth / 2;

      displayOrder.forEach((team, idx) => {
        const x = startX + idx * (colWidth + 30);
        const rankInfo = this.getRankColor(team.rank);

        let podiumHeight = 180;
        if (team.rank === 1) podiumHeight = 300;
        else if (team.rank === 2) podiumHeight = 240;
        else if (team.rank === 3) podiumHeight = 190;
        else podiumHeight = 140;

        const podiumTop = h - 140 - podiumHeight;

        const pedGrad = ctx.createLinearGradient(x - colWidth / 2, podiumTop, x + colWidth / 2, h - 140);
        pedGrad.addColorStop(0, rankInfo.secondary);
        pedGrad.addColorStop(1, '#0e111a');

        ctx.fillStyle = pedGrad;
        ctx.strokeStyle = rankInfo.primary;
        ctx.lineWidth = team.rank === 1 ? 3.5 : 2;
        ctx.shadowColor = rankInfo.glow;
        ctx.shadowBlur = team.rank === 1 ? 25 : 12;

        ctx.beginPath();
        ctx.roundRect(x - colWidth / 2, podiumTop, colWidth, podiumHeight, [12, 12, 0, 0]);
        ctx.fill();
        ctx.stroke();

        ctx.font = '900 48px "Orbitron", sans-serif';
        ctx.fillStyle = rankInfo.primary;
        ctx.fillText(`${team.rank}`, x, podiumTop + 65);

        ctx.font = '700 16px "Orbitron", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.letterSpacing = '2px';
        ctx.fillText(`${this.getRankOrdinal(team.rank)}`, x, podiumTop + 95);

        this.renderMiniMedal(x, podiumTop - 65, team.rank);

        ctx.font = team.rank === 1 ? '900 28px "Syne", sans-serif' : '700 22px "Syne", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = rankInfo.glow;
        ctx.shadowBlur = 15;
        ctx.fillText(team.name, x, podiumTop - 110);
      });
    } else {
      // Extended Top 6 to Top 50 Leaderboard View
      // 1. Center elevated podium for Top 3
      const top3 = [sortedTeams[1], sortedTeams[0], sortedTeams[2]].filter(Boolean); // 2nd, 1st, 3rd
      const podiumStartX = w / 2 - 270;
      top3.forEach((team, idx) => {
        const x = podiumStartX + idx * 270;
        const rankInfo = this.getRankColor(team.rank);
        const pHeight = team.rank === 1 ? 200 : (team.rank === 2 ? 155 : 125);
        const pTop = 415 - pHeight;

        ctx.fillStyle = rankInfo.secondary;
        ctx.strokeStyle = rankInfo.primary;
        ctx.lineWidth = team.rank === 1 ? 3 : 2;
        ctx.shadowColor = rankInfo.glow;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.roundRect(x - 115, pTop, 230, pHeight, [10, 10, 0, 0]);
        ctx.fill();
        ctx.stroke();

        ctx.font = '900 42px "Orbitron", sans-serif';
        ctx.fillStyle = rankInfo.primary;
        ctx.fillText(`${team.rank}`, x, pTop + 55);

        this.renderMiniMedal(x, pTop - 45, team.rank);

        ctx.font = '900 24px "Syne", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(team.name, x, pTop - 75);
      });

      // 2. Multi-column grid for ranks 4 through N (up to 50)
      const otherTeams = sortedTeams.slice(3);
      const cols = count > 24 ? 5 : 4;
      const cardW = (w * 0.9) / cols;
      const cardH = 40;
      const startGridY = 460;
      const startGridX = (w - (cols * cardW)) / 2;

      const maxShow = Math.min(otherTeams.length, 35);
      for (let i = 0; i < maxShow; i++) {
        const team = otherTeams[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cardX = startGridX + col * cardW + 6;
        const cardY = startGridY + row * (cardH + 8);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW - 12, cardH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '700 14px "Orbitron", sans-serif';
        ctx.fillStyle = '#00f2fe';
        ctx.fillText(`${team.rank}.`, cardX + 12, cardY + 25);

        ctx.font = '600 15px "Outfit", sans-serif';
        ctx.fillStyle = '#f8fafc';
        const displayLabel = team.name.length > 20 ? team.name.substring(0, 18) + '...' : team.name;
        ctx.fillText(displayLabel, cardX + 46, cardY + 25);
      }

      if (otherTeams.length > maxShow) {
        ctx.textAlign = 'center';
        ctx.font = '600 16px "Orbitron", sans-serif';
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.fillText(`+ ${otherTeams.length - maxShow} more winning finalists`, w / 2, h - 35);
      }
    }

    ctx.restore();
  }

  // Draw procedural 3D Medal for 2nd, 3rd, 4th, 5th place
  renderRankMedal(x, y, rank, time) {
    const ctx = this.ctx;
    const rankInfo = this.getRankColor(rank);

    ctx.save();
    ctx.translate(x, y);

    const bobbing = Math.sin(time * 3) * 6;
    ctx.translate(0, bobbing);

    // Ribbon straps
    ctx.fillStyle = rank === 2 ? '#455a64' : (rank === 3 ? '#5d4037' : '#1a237e');
    ctx.beginPath();
    ctx.moveTo(-25, -60);
    ctx.lineTo(-12, 0);
    ctx.lineTo(0, -10);
    ctx.lineTo(12, 0);
    ctx.lineTo(25, -60);
    ctx.closePath();
    ctx.fill();

    // Outer Glow Ring
    ctx.strokeStyle = rankInfo.primary;
    ctx.lineWidth = 6;
    ctx.shadowColor = rankInfo.glow;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.stroke();

    // Metallic Medallion Face
    const medalGrad = ctx.createLinearGradient(-40, -40, 40, 40);
    medalGrad.addColorStop(0, rankInfo.light);
    medalGrad.addColorStop(0.5, rankInfo.primary);
    medalGrad.addColorStop(1, rankInfo.secondary);

    ctx.fillStyle = medalGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.fill();

    // Inner embossed circle
    ctx.strokeStyle = rankInfo.secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();

    // Rank Number
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 42px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText(`${rank}`, 0, 0);

    ctx.restore();
  }

  // Draw Grand 3D Golden Trophy for 1st Place
  renderGrandChampionTrophy(x, y, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const bobbing = Math.sin(time * 3.5) * 8;
    ctx.translate(0, bobbing);

    // Glowing Aura behind Trophy
    const aura = ctx.createRadialGradient(0, -20, 20, 0, -20, 160);
    aura.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
    aura.addColorStop(0.7, 'rgba(255, 179, 0, 0.15)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -20, 160, 0, Math.PI * 2);
    ctx.fill();

    // Trophy Cup Top Body (Gold Metallic Gradient)
    const cupGrad = ctx.createLinearGradient(-60, -80, 60, 20);
    cupGrad.addColorStop(0, '#ffffff');
    cupGrad.addColorStop(0.2, '#fff59d');
    cupGrad.addColorStop(0.5, '#ffd700');
    cupGrad.addColorStop(0.8, '#ff8f00');
    cupGrad.addColorStop(1, '#ff6f00');

    ctx.fillStyle = cupGrad;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 35;

    // Cup Shape
    ctx.beginPath();
    ctx.moveTo(-50, -80);
    ctx.bezierCurveTo(-55, -20, -35, 15, 0, 25);
    ctx.bezierCurveTo(35, 15, 55, -20, 50, -80);
    ctx.closePath();
    ctx.fill();

    // Trophy Handles (Left and Right)
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffb300';
    ctx.shadowBlur = 20;

    // Left Handle
    ctx.beginPath();
    ctx.arc(-55, -45, 25, Math.PI * 0.4, Math.PI * 1.6, false);
    ctx.stroke();

    // Right Handle
    ctx.beginPath();
    ctx.arc(55, -45, 25, Math.PI * 1.4, Math.PI * 0.6, false);
    ctx.stroke();

    // Trophy Stem
    ctx.fillStyle = '#ff8f00';
    ctx.fillRect(-10, 25, 20, 30);

    // Trophy Pedestal Base
    ctx.fillStyle = '#422800';
    ctx.fillRect(-45, 55, 90, 25);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(-45, 55, 90, 25);

    // Embossed "1" on Cup
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 46px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.fillText("1", 0, -35);

    // Laurel Wreath Leaves surrounding trophy
    this.renderLaurelWreath(ctx, 0, -30, 85);

    ctx.restore();
  }

  renderLaurelWreath(ctx, cx, cy, radius) {
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.fillStyle = '#ffe082';
    ctx.lineWidth = 2.5;

    for (let side of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        const angle = Math.PI * 0.5 + side * (0.35 + i * 0.22);
        const lx = cx + Math.cos(angle) * radius;
        const ly = cy + Math.sin(angle) * (radius * 0.85);

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle + (side === 1 ? Math.PI / 3 : -Math.PI / 3));

        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  renderMiniMedal(x, y, rank) {
    const ctx = this.ctx;
    const rankInfo = this.getRankColor(rank);
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = rankInfo.primary;
    ctx.shadowColor = rankInfo.glow;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 4;
    ctx.fillText(`${rank}`, 0, 0);

    ctx.restore();
  }

  renderCinematicOverlay(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.8);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Subtle 16:9 Cinema letterbox border accents
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Corner targeting marks
    const len = 25;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(30, 30 + len);
    ctx.lineTo(30, 30);
    ctx.lineTo(30 + len, 30);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(w - 30 - len, 30);
    ctx.lineTo(w - 30, 30);
    ctx.lineTo(w - 30, 30 + len);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(30, h - 30 - len);
    ctx.lineTo(30, h - 30);
    ctx.lineTo(30 + len, h - 30);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(w - 30 - len, h - 30);
    ctx.lineTo(w - 30, h - 30);
    ctx.lineTo(w - 30, h - 30 - len);
    ctx.stroke();
  }

  // Export full video via MediaRecorder with synchronized audio!
  async startRecording(onProgress, onComplete) {
    if (this.isRecording) return;
    this.isRecording = true;
    this.recordedChunks = [];

    // Ensure audio context is running
    soundEngine.ensureContext();

    // Create stream from canvas
    const canvasStream = this.canvas.captureStream(60); // 60 FPS
    const audioTrack = soundEngine.getAudioStreamTrack();

    const combinedTracks = [...canvasStream.getVideoTracks()];
    if (audioTrack) {
      combinedTracks.push(audioTrack);
    }

    const combinedStream = new MediaStream(combinedTracks);

    // Supported mime types
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 6000000 // 6 Mbps HD quality
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
      const blob = new Blob(this.recordedChunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      if (onComplete) onComplete(url, selectedMime);
    };

    // Rewind and start recorder
    this.seek(0);
    this.mediaRecorder.start(100);
    this.play();

    // Track progress until completion
    const checkInterval = setInterval(() => {
      if (!this.isPlaying || this.currentTime >= this.duration) {
        clearInterval(checkInterval);
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } else {
        if (onProgress) onProgress(this.currentTime / this.duration);
      }
    }, 200);
  }
}
