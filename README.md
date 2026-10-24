# 🏆 Top Winners Announcement — Cinematic Video Studio

An interactive competition and hackathon winner announcement video generator built with HTML5, Vanilla CSS, and modern JavaScript.

## 🌟 Features

- **Step 1: Winner Count Selection**
  - Choose between **Top 1**, **Top 2**, **Top 3**, or **Top 5** podium reveal ceremonies.
- **Step 2: Dynamic Team Input**
  - Dynamically asks for team names in the exact announcement order (e.g. 3rd Place, 2nd Place, 1st Place).
  - Customizable competition/event branding and categories.
  - "✨ Fill Sample Teams" button for quick testing.
- **Step 3: 16:9 Cinematic Video Reveal**
  - **Epic Grand Opening**: Volumetric moving spotlights, ambient stardust, and high-impact title reveal.
  - **Ascending Reveal Scenes**: Progressive reveals for runner-ups with custom medallions (Bronze, Silver, Emerald, Amethyst).
  - **Grand Champion 1st Place Climax**: Dramatic suspense blackout, heartbeat drumroll, screen rumble, golden shockwave, radiant 3D rotating gold trophy, chrome typography, and a massive golden confetti and fireworks shower.
  - **Synthesized Web Audio Engine**: Zero external audio files required. Uses Web Audio API for cinematic fanfares, bass drops, risers, and applause.
  - **HD Video Export**: Uses `MediaRecorder` + Canvas Stream to download a high-definition `.webm` or `.mp4` video with synchronized audio.
  - **Multi-Theme Support**: Switch between *Gold & Obsidian*, *Cyber Neon*, and *Crimson E-Sports*.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/root-chinmay/Top_Team_Announcement.git
   cd Top_Team_Announcement
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

The compiled assets will be placed in the `dist/` directory.

## 🛠️ Tech Stack

- **HTML5 & Vanilla CSS**: Modern design system with glassmorphism, responsive 16:9 layout, and accessible validation states.
- **Canvas 2D Particle Engine**: 60 FPS physics-based confetti, fireworks, and shockwaves.
- **Web Audio API**: Real-time synthesized cinematic audio fanfare and effects.
- **Vite**: Lightweight, lightning-fast dev server and bundler.
