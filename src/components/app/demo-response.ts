import type { Artifact } from "@/types/chat";

/** The generative-art artifact Claude produces for a "random html" prompt. */
export const ORBIT_ARTIFACT: Artifact = {
  id: "orbit-generator",
  title: "Random orbit generator",
  language: "HTML",
  code: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Orbit Generator</title>
<style>
  :root {
    --ink: #1b1b1f;
    --paper: #eef0e9;
    --line: #cfd3c4;
    --accent1: #ff5d3a;
    --accent2: #2f6fed;
    --accent3: #ffcf3f;
    --mono: 'Courier New', monospace;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100%;
    background: var(--paper);
    font-family: var(--mono);
    color: var(--ink);
    overflow: hidden;
  }
  .wrap {
    position: relative;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 20px 28px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-size: 15px;
  }
  header .seed { color: #8a8d80; letter-spacing: 0.1em; }
  canvas { flex: 1; display: block; cursor: pointer; }
  .note {
    position: absolute;
    right: 28px;
    bottom: 28px;
    width: 230px;
    text-align: right;
    font-size: 12px;
    line-height: 1.7;
    color: #8a8d80;
  }
  button {
    position: absolute;
    left: 28px;
    bottom: 28px;
    padding: 14px 22px;
    border: 1px solid var(--ink);
    background: var(--paper);
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
  }
  button:hover { background: var(--ink); color: var(--paper); }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span>Orbit Generator</span>
    <span class="seed">seed — <b id="seed">000000</b></span>
  </header>
  <canvas id="c"></canvas>
  <button id="reroll">&#8635; Reroll</button>
  <p class="note">
    Every reroll draws a fresh little solar system: random count,
    random speed, random palette weight. Click anywhere on the canvas to pause.
  </p>
</div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const palette = ['#ff5d3a', '#2f6fed', '#ffcf3f', '#3fa66a', '#1b1b1f'];
  let planets = [], paused = false, t = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function reroll() {
    const count = 3 + Math.floor(Math.random() * 5);
    planets = Array.from({ length: count }, (_, i) => ({
      r: 70 + i * (40 + Math.random() * 40),
      speed: (Math.random() * 0.6 + 0.2) * (Math.random() < 0.3 ? -1 : 1),
      phase: Math.random() * Math.PI * 2,
      size: 6 + Math.random() * 10,
      squash: 0.55 + Math.random() * 0.4,
      color: palette[Math.floor(Math.random() * palette.length)]
    }));
    document.getElementById('seed').textContent =
      String(Math.floor(Math.random() * 1e6)).padStart(6, '0');
  }

  function draw() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;

    ctx.strokeStyle = '#cfd3c4';
    ctx.lineWidth = 1;
    planets.forEach(p => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, p.r, p.r * p.squash, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    planets.forEach(p => {
      const a = p.phase + t * p.speed;
      const x = cx + Math.cos(a) * p.r;
      const y = cy + Math.sin(a) * p.r * p.squash;
      const trail = ctx.createLinearGradient(x, y, cx, cy);
      trail.addColorStop(0, p.color);
      trail.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = trail;
      ctx.lineWidth = p.size * 0.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(cx + Math.cos(a - 0.25) * p.r, cy + Math.sin(a - 0.25) * p.r * p.squash);
      ctx.stroke();

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!paused) t += 0.01;
    requestAnimationFrame(draw);
  }

  addEventListener('resize', resize);
  canvas.addEventListener('click', () => { paused = !paused; });
  document.getElementById('reroll').addEventListener('click', reroll);
  resize();
  reroll();
  draw();
</script>
</body>
</html>`,
};

/** Rotating spinner captions Claude cycles through while working. */
export const THINKING_LABELS = [
  "Thinking",
  "Triangulating",
  "Percolating",
  "Ruminating",
  "Noodling",
];
