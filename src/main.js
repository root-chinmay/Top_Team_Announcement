// Main Application Controller for Top Winners Announcement Studio
import { VideoEngine } from './videoEngine.js';
import { soundEngine } from './audio.js';

// Application State
const state = {
  currentStep: 1, // 1 | 2 | 3
  selectedCount: 3, // Supports 1 to 50
  eventTitle: "GLOBAL INNOVATION HACKATHON 2026",
  eventSubtitle: "GRAND FINALE AWARDS CEREMONY",
  teams: [],
  theme: 'gold', // 'gold' | 'cyber' | 'esports'
  isMuted: false
};

// Rich pool of 50 unique, creative hackathon/competition team names
const sampleTeamNamesPool = [
  { name: "CyberTitans", tagline: "Generative Surgical Robotics" },
  { name: "QuantumLeap", tagline: "Sub-atomic Encryption Protocol" },
  { name: "Apex Innovators", tagline: "Zero-Carbon Distributed Grid" },
  { name: "EchoVision Labs", tagline: "Spatial Holographic Neural UI" },
  { name: "BioSynthetix", tagline: "Synthetic Protein Therapeutics" },
  { name: "NeuralForge AI", tagline: "Autonomous Multi-Agent Systems" },
  { name: "SolarVanguard", tagline: "Perovskite Solar Nanotech" },
  { name: "NexusPrime", tagline: "Decentralized Compute Fabric" },
  { name: "HyperDrive Systems", tagline: "Next-Gen EV Powertrains" },
  { name: "VortexDynamics", tagline: "Deep Sea Oceanographic Sensing" },
  { name: "AetherMind", tagline: "Cognitive Brain-Computer Interface" },
  { name: "OmniPulse", tagline: "Autonomous Emergency Drone Fleets" },
  { name: "IronClad Security", tagline: "Zero-Trust Quantum Defense" },
  { name: "SkyWard Aero", tagline: "Electric Vertical Takeoff Flight" },
  { name: "PulseLogic", tagline: "Ultra-Low Power Edge Silicon" },
  { name: "TerraNova Biotech", tagline: "Carbon-Capture Soil Microbes" },
  { name: "AuraHealth", tagline: "Real-time Diagnostic Biowearables" },
  { name: "SpectraPhotonics", tagline: "Optical Neural Accelerators" },
  { name: "Helios Energy", tagline: "Compact Fusion Plasma Magnets" },
  { name: "Chronos AI", tagline: "High-Frequency Predictive Climate" },
  { name: "SynthetixCore", tagline: "Protein Folding Simulation" },
  { name: "ZeroGravity Labs", tagline: "Orbital Satellite Debris Scavengers" },
  { name: "Aegis Robotics", tagline: "Disaster Search & Rescue Droids" },
  { name: "MetaMorphix", tagline: "Programmable Smart Biomaterials" },
  { name: "Titanium Forge", tagline: "Aerospace 3D Metal Additive" },
  { name: "DeepBlue Intelligence", tagline: "Autonomous Submarine Exploration" },
  { name: "PhotonWave", tagline: "Quantum LiDAR Sensor Arrays" },
  { name: "NeuroLinker", tagline: "Motor Cortex Restoration Implant" },
  { name: "BioShield Therapeutics", tagline: "CRISPR Epigenetic Regulators" },
  { name: "Starlight Dynamics", tagline: "Deep Space Propulsion Units" },
  { name: "CyberPulse", tagline: "Autonomous Intrusion Countermeasures" },
  { name: "EchoLogic", tagline: "Ultrasonic Acoustic Metamaterials" },
  { name: "SynapseWave", tagline: "Neuromorphic Sensor Processing" },
  { name: "OmniGrid", tagline: "Self-Healing Citywide Microgrids" },
  { name: "Solaris AI", tagline: "Space-Based Solar Microwave Relay" },
  { name: "AeroVanguard", tagline: "Supersonic Commercial Aerodynamics" },
  { name: "CryoLogic", tagline: "Solid-State Superconducting Logic" },
  { name: "NanoForge", tagline: "Molecular Assembler Nanomachines" },
  { name: "Vitalis Health", tagline: "Personalized mRNA Vaccines" },
  { name: "Horizon Robotics", tagline: "Agricultural Autonomous Harvesters" },
  { name: "Vektor Dynamics", tagline: "High-G Vector Thruster Tech" },
  { name: "Prism Vision", tagline: "Hyper-spectral Medical Imagers" },
  { name: "TerraPulse", tagline: "Planetary Seismological Warnings" },
  { name: "QuantumMatrix", tagline: "Fault-Tolerant Topological Qubits" },
  { name: "AetherShield", tagline: "Electromagnetic Defense Dome" },
  { name: "BioForge Labs", tagline: "Enzymatic Plastic Upcycling" },
  { name: "NexusAero", tagline: "Hydrogen Fuel Cell Aviation" },
  { name: "CerebroTech", tagline: "Direct Cortical Vision Synthesis" },
  { name: "NovaEnergy", tagline: "Geothermal Superheated Drilling" },
  { name: "Apex Pioneers", tagline: "Extraterrestrial Habitation Pods" }
];

// DOM Elements
let dom = {};
let videoEngine = null;

document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  initVideoEngine();
  attachEventListeners();
  updateCountDisplay(state.selectedCount);
  renderStep(1);
});

function initDOMElements() {
  dom = {
    // Stepper navigation
    stepNav1: document.getElementById('stepNav1'),
    stepNav2: document.getElementById('stepNav2'),
    stepNav3: document.getElementById('stepNav3'),

    // Panels
    step1Panel: document.getElementById('step1Panel'),
    step2Panel: document.getElementById('step2Panel'),
    step3Panel: document.getElementById('step3Panel'),

    // Step 1 controls (1 to 50 selector)
    winnerCountInput: document.getElementById('winnerCountInput'),
    winnerCountSlider: document.getElementById('winnerCountSlider'),
    btnCountMinus: document.getElementById('btnCountMinus'),
    btnCountPlus: document.getElementById('btnCountPlus'),
    presetPills: document.querySelectorAll('.preset-pill'),
    durationSummaryBadge: document.getElementById('durationSummaryBadge'),
    btnProceedToStep2: document.getElementById('btnProceedToStep2'),

    // Step 2 controls
    teamNamesForm: document.getElementById('teamNamesForm'),
    dynamicTeamsContainer: document.getElementById('dynamicTeamsContainer'),
    selectedWinnerCountBadge: document.getElementById('selectedWinnerCountBadge'),
    eventTitleInput: document.getElementById('eventTitleInput'),
    eventSubtitleInput: document.getElementById('eventSubtitleInput'),
    btnBackToStep1: document.getElementById('btnBackToStep1'),
    btnAutofill: document.getElementById('btnAutofill'),
    btnToggleBulkPaste: document.getElementById('btnToggleBulkPaste'),
    bulkPasteDrawer: document.getElementById('bulkPasteDrawer'),
    bulkPasteInput: document.getElementById('bulkPasteInput'),
    btnApplyBulkPaste: document.getElementById('btnApplyBulkPaste'),
    btnGenerateVideo: document.getElementById('btnGenerateVideo'),

    // Step 3 controls
    canvas: document.getElementById('announcementCanvas'),
    canvasPlayOverlay: document.getElementById('canvasPlayOverlay'),
    bigPlayBtn: document.getElementById('bigPlayBtn'),
    videoScrubber: document.getElementById('videoScrubber'),
    timelineMarkersTrack: document.getElementById('timelineMarkersTrack'),
    btnPlayPause: document.getElementById('btnPlayPause'),
    playPauseIcon: document.getElementById('playPauseIcon'),
    btnRestart: document.getElementById('btnRestart'),
    currentTimeDisplay: document.getElementById('currentTimeDisplay'),
    totalTimeDisplay: document.getElementById('totalTimeDisplay'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    btnEditTeams: document.getElementById('btnEditTeams'),
    btnNewAnnouncement: document.getElementById('btnNewAnnouncement'),
    btnExportVideo: document.getElementById('btnExportVideo'),
    exportText: document.getElementById('exportText'),

    // Header controls
    toggleAudioBtn: document.getElementById('toggleAudioBtn'),
    audioBtnText: document.getElementById('audioBtnText'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Recording Modal
    recordingModal: document.getElementById('recordingModal'),
    recordingProgressFill: document.getElementById('recordingProgressFill'),
    recordingPercentText: document.getElementById('recordingPercentText')
  };
}

function initVideoEngine() {
  videoEngine = new VideoEngine(dom.canvas);

  // Time update listener from engine
  videoEngine.onTimeUpdate = (currentTime, duration) => {
    dom.videoScrubber.value = currentTime;
    dom.videoScrubber.max = duration;

    dom.currentTimeDisplay.textContent = formatTime(currentTime);
    dom.totalTimeDisplay.textContent = formatTime(duration);

    updateTimelineActiveMarker(currentTime);
  };

  // Play / Pause state listener from engine
  videoEngine.onStateChange = (isPlaying) => {
    dom.playPauseIcon.textContent = isPlaying ? '⏸' : '▶';
    if (isPlaying) {
      dom.canvasPlayOverlay.classList.remove('visible');
    } else {
      if (videoEngine.currentTime === 0 || videoEngine.currentTime >= videoEngine.duration) {
        dom.canvasPlayOverlay.classList.add('visible');
      }
    }
  };
}

function attachEventListeners() {
  // Step 1: Number input change
  dom.winnerCountInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 1;
    val = Math.max(1, Math.min(50, val));
    updateCountDisplay(val);
  });

  dom.winnerCountInput.addEventListener('blur', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 50) val = 50;
    e.target.value = val;
    updateCountDisplay(val);
  });

  // Step 1: Slider input
  dom.winnerCountSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    updateCountDisplay(val);
  });

  // Step 1: Minus Button
  dom.btnCountMinus.addEventListener('click', () => {
    const nextVal = Math.max(1, state.selectedCount - 1);
    updateCountDisplay(nextVal);
  });

  // Step 1: Plus Button
  dom.btnCountPlus.addEventListener('click', () => {
    const nextVal = Math.min(50, state.selectedCount + 1);
    updateCountDisplay(nextVal);
  });

  // Step 1: Preset Pills
  dom.presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const count = parseInt(pill.dataset.count, 10);
      updateCountDisplay(count);
    });
  });

  // Step 1: Continue Button
  dom.btnProceedToStep2.addEventListener('click', () => {
    renderStep(2);
  });

  // Step 2: Back Button
  dom.btnBackToStep1.addEventListener('click', () => {
    renderStep(1);
  });

  // Step 2: Toggle Bulk Paste Drawer
  dom.btnToggleBulkPaste.addEventListener('click', () => {
    dom.bulkPasteDrawer.classList.toggle('active');
    if (dom.bulkPasteDrawer.classList.contains('active')) {
      dom.bulkPasteInput.focus();
    }
  });

  // Step 2: Apply Bulk Paste
  dom.btnApplyBulkPaste.addEventListener('click', () => {
    applyBulkPaste();
  });

  // Step 2: Auto-fill Demo Data
  dom.btnAutofill.addEventListener('click', () => {
    fillSampleTeams();
  });

  // Step 2: Form Submit (Generate Video)
  dom.teamNamesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  // Stepper Header Direct Clicks (for completed steps)
  dom.stepNav1.addEventListener('click', () => {
    renderStep(1);
  });

  dom.stepNav2.addEventListener('click', () => {
    if (state.currentStep > 1) {
      renderStep(2);
    }
  });

  // Step 3: Player Controls
  dom.btnPlayPause.addEventListener('click', () => {
    videoEngine.togglePlay();
  });

  dom.bigPlayBtn.addEventListener('click', () => {
    videoEngine.play();
  });

  dom.canvasPlayOverlay.addEventListener('click', () => {
    videoEngine.play();
  });

  dom.btnRestart.addEventListener('click', () => {
    videoEngine.seek(0);
    videoEngine.play();
  });

  // Timeline Scrubber
  dom.videoScrubber.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    videoEngine.seek(val);
  });

  // Fullscreen
  dom.btnFullscreen.addEventListener('click', () => {
    toggleFullscreen();
  });

  // Edit Teams button in Step 3
  dom.btnEditTeams.addEventListener('click', () => {
    videoEngine.pause();
    renderStep(2);
  });

  // Change Winners count button in Step 3
  dom.btnNewAnnouncement.addEventListener('click', () => {
    videoEngine.pause();
    renderStep(1);
  });

  // Export HD Video
  dom.btnExportVideo.addEventListener('click', () => {
    startExport();
  });

  // Header Audio Toggle
  dom.toggleAudioBtn.addEventListener('click', () => {
    const isMuted = soundEngine.toggleMute();
    state.isMuted = isMuted;
    dom.toggleAudioBtn.classList.toggle('muted', isMuted);
    dom.audioBtnText.textContent = isMuted ? 'Sound: MUTED' : 'Sound: ON';
  });

  // Header Theme Switcher
  dom.themeToggleBtn.addEventListener('click', () => {
    cycleTheme();
  });

  // Keyboard Shortcuts: Spacebar to toggle play, R to restart
  window.addEventListener('keydown', (e) => {
    // Only if not currently typing in an input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentStep === 3) {
        videoEngine.togglePlay();
      }
    } else if (e.code === 'KeyR') {
      if (state.currentStep === 3) {
        videoEngine.seek(0);
        videoEngine.play();
      }
    }
  });

  // Modern Web Guidance: Sync aria-invalid with CSS :user-invalid state
  const syncAria = (el) => {
    if (el && el.matches) {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
  };

  document.addEventListener('blur', (e) => {
    if (e.target.matches && e.target.matches('.validated-input')) {
      syncAria(e.target);
    }
  }, true);

  document.addEventListener('input', (e) => {
    if (e.target.matches && e.target.matches('.validated-input')) {
      if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
    }
  });
}

// Update the 1-50 Count Display across input, slider, preset pills, and duration badge
function updateCountDisplay(val) {
  state.selectedCount = val;

  dom.winnerCountInput.value = val;
  dom.winnerCountSlider.value = val;

  dom.btnCountMinus.disabled = val <= 1;
  dom.btnCountPlus.disabled = val >= 50;

  // Highlight active preset if matches exactly
  dom.presetPills.forEach(pill => {
    const pCount = parseInt(pill.dataset.count, 10);
    pill.classList.toggle('active', pCount === val);
  });

  // Calculate Ceremony Duration: 3.5s intro + (3s countdown + 10s reveal per team) + 6.0s podium
  const totalSeconds = 3.5 + val * 13.0 + 6.0;
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;

  dom.durationSummaryBadge.innerHTML = `
    <span>⏱ Estimated Ceremony: ~${timeStr} (3s Countdown + 10s Reveal per Team)</span>
  `;
}

// Render active Step (1, 2, or 3)
function renderStep(stepNumber) {
  state.currentStep = stepNumber;

  // Update panels visibility
  dom.step1Panel.classList.toggle('active', stepNumber === 1);
  dom.step2Panel.classList.toggle('active', stepNumber === 2);
  dom.step3Panel.classList.toggle('active', stepNumber === 3);

  // Update stepper breadcrumbs
  dom.stepNav1.classList.toggle('active', stepNumber === 1);
  dom.stepNav1.classList.toggle('completed', stepNumber > 1);

  dom.stepNav2.classList.toggle('active', stepNumber === 2);
  dom.stepNav2.classList.toggle('completed', stepNumber > 2);

  dom.stepNav3.classList.toggle('active', stepNumber === 3);

  if (stepNumber === 2) {
    setupStep2Form();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  } else if (stepNumber === 3) {
    setupStep3Player();
    window.scrollTo({ top: 100, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// STEP 2: Dynamically Generate the Exact Required Team Inputs for any number (1 to 50)
function setupStep2Form() {
  const count = state.selectedCount;
  dom.selectedWinnerCountBadge.textContent = `🏆 Announcing: Top ${count} Winner${count > 1 ? 's' : ''}`;

  dom.dynamicTeamsContainer.innerHTML = '';
  dom.bulkPasteDrawer.classList.remove('active');

  // Order of questions: Reveal order from highest rank down to 1st place!
  // E.g. for Top 3: 3rd, 2nd, 1st
  // E.g. for Top 5: 5th, 4th, 3rd, 2nd, 1st
  const rankOrder = [];
  for (let r = count; r >= 1; r--) {
    rankOrder.push(r);
  }

  rankOrder.forEach(rank => {
    const ordinal = getRankOrdinal(rank);
    const existingTeam = state.teams.find(t => t.rank === rank) || {};
    const defaultName = existingTeam.name || '';
    const defaultTagline = existingTeam.tagline || '';

    const card = document.createElement('div');
    card.className = `team-entry-card rank-${rank}`;

    let rankIcon = '💎';
    let rankTitle = `${ordinal} Place Team`;
    if (rank === 1) {
      rankIcon = '👑';
      rankTitle = '1st Place Team (Grand Champion)';
    } else if (rank === 2) {
      rankIcon = '🥈';
      rankTitle = '2nd Place Team (Runner-Up)';
    } else if (rank === 3) {
      rankIcon = '🥉';
      rankTitle = '3rd Place Team';
    }

    card.innerHTML = `
      <div class="team-card-header">
        <div class="team-rank-tag">
          <span aria-hidden="true">${rankIcon}</span>
          <span>${rankTitle}</span>
        </div>
      </div>

      <div class="team-input-group">
        <div class="input-field-wrap">
          <label for="teamName_${rank}" class="field-label">
            Enter the ${ordinal} Place Team Name:<span class="required-star">*</span>
          </label>
          <input 
            type="text" 
            id="teamName_${rank}" 
            name="teamName_${rank}"
            data-rank="${rank}"
            class="validated-input"
            required 
            minlength="2"
            maxlength="36"
            value="${escapeHtml(defaultName)}"
            placeholder="e.g. CyberTitans"
            aria-describedby="teamHint_${rank}"
            aria-errormessage="teamError_${rank}"
          >
          <div id="teamError_${rank}" class="input-error-msg">
            ⚠️ Please enter the ${ordinal} Place team name (at least 2 characters).
          </div>
        </div>

        <div class="input-field-wrap">
          <label for="teamTagline_${rank}" class="field-label">
            Project / Tagline (Optional)
          </label>
          <input 
            type="text" 
            id="teamTagline_${rank}" 
            name="teamTagline_${rank}"
            data-tagline-rank="${rank}"
            class="text-input"
            maxlength="45"
            value="${escapeHtml(defaultTagline)}"
            placeholder="e.g. Autonomous AI Drone Swarm"
          >
        </div>
      </div>
    `;

    dom.dynamicTeamsContainer.appendChild(card);
  });

  // Focus the first input field
  const firstInput = dom.dynamicTeamsContainer.querySelector('.validated-input');
  if (firstInput) firstInput.focus();
}

function getRankOrdinal(rank) {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Quick Fill Sample Teams for testing (Supports up to 50 teams)
function fillSampleTeams() {
  const count = state.selectedCount;

  // Rank 1 gets the top pool item, rank 2 gets 2nd, etc.
  for (let r = 1; r <= count; r++) {
    const sample = sampleTeamNamesPool[(r - 1) % sampleTeamNamesPool.length];
    const nameInput = document.getElementById(`teamName_${r}`);
    const tagInput = document.getElementById(`teamTagline_${r}`);
    if (nameInput) nameInput.value = `${sample.name}${r > sampleTeamNamesPool.length ? ' #' + r : ''}`;
    if (tagInput) tagInput.value = sample.tagline;
  }
}

// Bulk Paste Names: Parses lines and fills inputs
function applyBulkPaste() {
  const rawText = dom.bulkPasteInput.value.trim();
  if (!rawText) return;

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const count = state.selectedCount;

  // Check if lines were pasted 1st to Nth or Nth to 1st
  // If first line starts with 1 or user pasted normally:
  lines.forEach((line, idx) => {
    // Clean leading rank numbers if any (e.g. "1. CyberTitans" -> "CyberTitans")
    const cleanName = line.replace(/^\d+[\.\)\-\:\s]+/, '').trim();
    const rank = idx + 1; // 1st, 2nd, 3rd...
    if (rank <= count) {
      const nameInput = document.getElementById(`teamName_${rank}`);
      if (nameInput) nameInput.value = cleanName;
    }
  });

  dom.bulkPasteDrawer.classList.remove('active');
}

// Handle Form Submission in Step 2 -> Transition to Step 3
function handleFormSubmit() {
  const nameInputs = dom.dynamicTeamsContainer.querySelectorAll('.validated-input');
  let hasError = false;
  let firstInvalid = null;

  nameInputs.forEach(input => {
    if (!input.checkValidity()) {
      hasError = true;
      if (!firstInvalid) firstInvalid = input;
    }
  });

  if (hasError) {
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Collect Teams Data
  const collectedTeams = [];
  nameInputs.forEach(input => {
    const rank = parseInt(input.dataset.rank, 10);
    const taglineInput = document.querySelector(`input[data-tagline-rank="${rank}"]`);
    collectedTeams.push({
      rank: rank,
      name: input.value.trim(),
      tagline: taglineInput ? taglineInput.value.trim() : ''
    });
  });

  state.teams = collectedTeams;
  state.eventTitle = dom.eventTitleInput.value.trim() || "GLOBAL INNOVATION HACKATHON 2026";
  state.eventSubtitle = dom.eventSubtitleInput.value.trim() || "GRAND FINALE AWARDS CEREMONY";

  // Transition to Step 3: Generate the Video!
  renderStep(3);
}

// STEP 3: Setup and Start the Video Engine
function setupStep3Player() {
  videoEngine.setData({
    eventTitle: state.eventTitle,
    eventSubtitle: state.eventSubtitle,
    winnerCount: state.selectedCount,
    teams: state.teams,
    theme: state.theme
  });

  // Build timeline scene markers
  buildTimelineMarkers();

  // Reset & start playback automatically with cinematic sound!
  videoEngine.seek(0);
  videoEngine.play();
}

function buildTimelineMarkers() {
  dom.timelineMarkersTrack.innerHTML = '';
  const total = videoEngine.duration;

  // Filter scenes to display cleanly on the timeline track
  // For small counts, show all. For large counts (e.g. > 10), show intro, podium, 1st, 2nd, 3rd, and major milestones
  const allScenes = videoEngine.sceneSchedule;
  const filteredScenes = allScenes.filter(scene => {
    if (allScenes.length <= 14) return true;
    if (scene.type === 'intro' || scene.type === 'podium' || scene.type === 'champion' || scene.type === 'champion_countdown') return true;
    if (scene.type === 'rank' && (scene.rank <= 3 || scene.rank % 5 === 0)) return true;
    return false;
  });

  filteredScenes.forEach(scene => {
    const marker = document.createElement('span');
    marker.className = 'scene-marker';
    marker.textContent = scene.label;
    marker.dataset.start = scene.start;
    marker.title = `Jump to ${scene.label} (${formatTime(scene.start)})`;

    marker.addEventListener('click', () => {
      videoEngine.seek(scene.start);
      videoEngine.play();
    });

    dom.timelineMarkersTrack.appendChild(marker);
  });
}

function updateTimelineActiveMarker(currentTime) {
  const markers = dom.timelineMarkersTrack.querySelectorAll('.scene-marker');
  const activeScene = videoEngine.sceneSchedule.find(s => currentTime >= s.start && currentTime < s.end);

  markers.forEach(m => {
    const mStart = parseFloat(m.dataset.start);
    const isActive = activeScene && Math.abs(activeScene.start - mStart) < 0.1;
    m.classList.toggle('active', isActive);
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function toggleFullscreen() {
  const container = document.getElementById('cinemaPlayerContainer');
  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Cycle between themes (Gold -> Cyber -> E-Sports)
function cycleTheme() {
  const themes = ['gold', 'cyber', 'esports'];
  const labels = {
    'gold': '🎨 Theme: Gold & Obsidian',
    'cyber': '🎨 Theme: Cyber Neon',
    'esports': '🎨 Theme: Crimson E-Sports'
  };

  const currentIdx = themes.indexOf(state.theme);
  const nextTheme = themes[(currentIdx + 1) % themes.length];
  state.theme = nextTheme;

  dom.themeToggleBtn.querySelector('span').textContent = labels[nextTheme];

  if (videoEngine) {
    videoEngine.theme = nextTheme;
    videoEngine.renderFrame(videoEngine.currentTime);
  }
}

// Start Video Export
function startExport() {
  dom.btnExportVideo.disabled = true;
  dom.exportText.textContent = 'Rendering...';
  dom.recordingModal.classList.add('active');
  dom.recordingProgressFill.style.width = '0%';
  dom.recordingPercentText.textContent = '0%';

  videoEngine.startRecording(
    // onProgress
    (progress) => {
      const pct = Math.floor(progress * 100);
      dom.recordingProgressFill.style.width = `${pct}%`;
      dom.recordingPercentText.textContent = `${pct}%`;
    },
    // onComplete
    (videoUrl, mimeType) => {
      dom.recordingModal.classList.remove('active');
      dom.btnExportVideo.disabled = false;
      dom.exportText.textContent = 'Export HD Video';

      // Trigger instant download
      const a = document.createElement('a');
      a.href = videoUrl;
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      a.download = `Top_Winners_Announcement_${state.selectedCount}_Teams.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  );
}
