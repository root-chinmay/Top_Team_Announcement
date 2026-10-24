// Main Application Controller for Top Winners Announcement Studio
import { VideoEngine } from './videoEngine.js';
import { soundEngine } from './audio.js';

// Application State
const state = {
  currentStep: 1, // 1 | 2 | 3
  selectedCount: 3, // 1 | 2 | 3 | 5
  eventTitle: "GLOBAL INNOVATION HACKATHON 2026",
  eventSubtitle: "GRAND FINALE AWARDS CEREMONY",
  teams: [],
  theme: 'gold', // 'gold' | 'cyber' | 'esports'
  isMuted: false
};

// Preset demo team names for instant testing
const sampleDataByCount = {
  1: [
    { rank: 1, name: "NeuralForge AI", tagline: "Autonomous Multi-Agent Robotics" }
  ],
  2: [
    { rank: 2, name: "QuantumLeap", tagline: "Sub-atomic Encryption Protocol" },
    { rank: 1, name: "NeuralForge AI", tagline: "Autonomous Multi-Agent Robotics" }
  ],
  3: [
    { rank: 3, name: "Apex Innovators", tagline: "Zero-Carbon Distributed Grid" },
    { rank: 2, name: "QuantumLeap", tagline: "Sub-atomic Encryption Protocol" },
    { rank: 1, name: "CyberTitans", tagline: "Generative Surgical Robotics" }
  ],
  5: [
    { rank: 5, name: "BioSynthetix", tagline: "Synthetic Protein Therapeutics" },
    { rank: 4, name: "EchoVision Labs", tagline: "Spatial Holographic Neural UI" },
    { rank: 3, name: "Apex Innovators", tagline: "Zero-Carbon Distributed Grid" },
    { rank: 2, name: "QuantumLeap", tagline: "Sub-atomic Encryption Protocol" },
    { rank: 1, name: "CyberTitans", tagline: "Generative Surgical Robotics" }
  ]
};

// DOM Elements
let dom = {};
let videoEngine = null;

document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  initVideoEngine();
  attachEventListeners();
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

    // Step 1 controls
    optionCards: document.querySelectorAll('.option-card'),
    btnProceedToStep2: document.getElementById('btnProceedToStep2'),

    // Step 2 controls
    teamNamesForm: document.getElementById('teamNamesForm'),
    dynamicTeamsContainer: document.getElementById('dynamicTeamsContainer'),
    selectedWinnerCountBadge: document.getElementById('selectedWinnerCountBadge'),
    eventTitleInput: document.getElementById('eventTitleInput'),
    eventSubtitleInput: document.getElementById('eventSubtitleInput'),
    btnBackToStep1: document.getElementById('btnBackToStep1'),
    btnAutofill: document.getElementById('btnAutofill'),
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
  // Step 1: Option Card Clicks
  dom.optionCards.forEach(card => {
    card.addEventListener('click', () => {
      const count = parseInt(card.dataset.count, 10);
      selectWinnerCount(count);
    });

    // Keyboard navigation (Enter / Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const count = parseInt(card.dataset.count, 10);
        selectWinnerCount(count);
      }
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

// Select Winner Count in Step 1
function selectWinnerCount(count) {
  state.selectedCount = count;
  dom.optionCards.forEach(card => {
    const isSelected = parseInt(card.dataset.count, 10) === count;
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // Smooth highlight feedback
  dom.btnProceedToStep2.focus();
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

// STEP 2: Dynamically Generate the Exact Required Team Inputs
// Following prompt instructions:
// If Top 3:
// "Enter the 3rd Place Team Name:"
// "Enter the 2nd Place Team Name:"
// "Enter the 1st Place Team Name:"
// If Top 5: 5th, 4th, 3rd, 2nd, 1st
function setupStep2Form() {
  const count = state.selectedCount;
  dom.selectedWinnerCountBadge.textContent = `🏆 Announcing: Top ${count} Winner${count > 1 ? 's' : ''}`;

  dom.dynamicTeamsContainer.innerHTML = '';

  // Order of questions: Reveal order from highest number down to 1st place!
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
            maxlength="32"
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

// Quick Fill Sample Teams for testing
function fillSampleTeams() {
  const count = state.selectedCount;
  const samples = sampleDataByCount[count] || sampleDataByCount[3];

  samples.forEach(item => {
    const nameInput = document.getElementById(`teamName_${item.rank}`);
    const tagInput = document.getElementById(`teamTagline_${item.rank}`);
    if (nameInput) nameInput.value = item.name;
    if (tagInput) tagInput.value = item.tagline;
  });
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

  videoEngine.sceneSchedule.forEach(scene => {
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
