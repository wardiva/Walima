// One canvas, one loop: every particle effect in the invitation.
//   petals()        ivory & ice-blue petal shower (envelope opens, date revealed)
//   sparkle(x, y)   gold/ivory star burst (tap anywhere, writing ends…)
//   dust(x, y)      a few motes trailing the finger
//   confetti(x, y)  silver, gold, ivory & blue confetti ("I Will Attend")
//   hearts(x, y)    maroon & blush hearts floating up
//   crumbs(x, y)    maroon wax shards (the seal cracks)
//   drift()         a slow handful of blue petals ("Can't Attend")
//   firework(x, y)  a rocket that bursts into gold, ivory and ice sparks
// The loop only runs while particles are alive. Coordinates are relative to
// the canvas (the phone column).

const IVORY = [["#fffdf8", "#ece4d6"], ["#fbf7f0", "#e3d9c8"], ["#ffffff", "#efe8dc"], ["#f6f1e8", "#ddd2c1"]];
const BLUE = [["#dde9ee", "#a9bfcd"], ["#cfdfe8", "#94adbf"], ["#e6eef2", "#b8cad6"]];
const SPARK = ["#fff6dc", "#e2c98f", "#f3e3bb", "#ffffff", "#d9bf86"];
const CONFETTI = ["#e2c98f", "#c9ab72", "#eef2f5", "#b6c1ca", "#fbf8f1", "#9fb4c3", "#5f7a90", "#8a3340"];
const FW = [["#f3e3bb", "#e2c98f"], ["#ffffff", "#dde8eb"], ["#cfe0ea", "#9fb4c3"], ["#f4c9bd", "#e9b9a6"]];
const HEARTS = ["#8a3340", "#a9404c", "#e9b9a6", "#c46a74"];
const pick = (a) => a[(Math.random() * a.length) | 0];
const rnd = (a, b) => a + Math.random() * (b - a);
const MAX = 520;

export function createFx(canvas, { reducedMotion = false } = {}) {
  const ctx = canvas.getContext("2d");
  let parts = [];
  let raf = 0, prev = 0, clock = 0;
  let w = 0, h = 0, dpr = 1, unit = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    if (r.width === w && r.height === h && canvas.width) return;
    w = r.width; h = r.height; unit = w / 504;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  };
  window.addEventListener("resize", () => { w = 0; resize(); });

  const add = (p) => { if (parts.length < MAX) parts.push(p); };
  const start = () => {
    if (raf) return;
    resize();
    prev = performance.now();
    raf = requestAnimationFrame(frame);
  };

  /* ── drawing helpers ── */
  const star = (x, y, r, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(0, -r); ctx.rotate(Math.PI / 4);
      ctx.lineTo(0, -r * 0.28); ctx.rotate(Math.PI / 4);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  };
  const heart = (x, y, s, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 24, s / 24);
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-2, 6, -12, 0, -12, -6); ctx.bezierCurveTo(-12, -11, -6, -13, 0, -7);
    ctx.bezierCurveTo(6, -13, 12, -11, 12, -6); ctx.bezierCurveTo(12, 0, 2, 6, 0, 8);
    ctx.fill(); ctx.restore();
  };
  const petal = (p, t) => {
    const flip = Math.cos(t * p.flipF + p.phase);
    ctx.save();
    ctx.translate(p.x + Math.sin(t * p.swayF + p.phase) * p.sway, p.y);
    ctx.rotate(p.rot + t * p.vr);
    ctx.scale(1, 0.25 + 0.75 * Math.abs(flip));
    const L = p.size, W = p.size * p.aspect;
    const g = ctx.createLinearGradient(-W / 2, -L / 2, W / 2, L / 2);
    g.addColorStop(0, flip > 0 ? p.c1 : p.c2);
    g.addColorStop(1, flip > 0 ? p.c2 : p.c1);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, L / 2);
    ctx.bezierCurveTo(W * 0.62, L * 0.32, W * 0.6, -L * 0.42, W * 0.12, -L / 2);
    ctx.quadraticCurveTo(0, -L * 0.42, -W * 0.12, -L / 2);
    ctx.bezierCurveTo(-W * 0.6, -L * 0.42, -W * 0.62, L * 0.32, 0, L / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(70,95,120,0.14)"; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.restore();
  };

  /* ── the loop ── */
  function frame(now) {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now; clock += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const next = [];
    for (const p of parts) {
      p.age += dt;
      if (p.age < 0) { next.push(p); continue; }
      const k = p.age / p.life;
      if (k >= 1 || p.y > h + 60) {
        if (p.kind === "rocket") burst(p.x, p.y, p.col);
        continue;
      }
      // physics
      p.vy += (p.g || 0) * dt;
      if (p.drag) { const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vy *= d; }
      p.px = p.x; p.py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt;
      next.push(p);
      // draw
      const fade = p.fadeIn ? Math.min(1, p.age / p.fadeIn) : 1;
      const out = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      ctx.globalAlpha = fade * out * (p.alpha ?? 1);
      switch (p.kind) {
        case "petal": ctx.globalAlpha = fade * (k > 0.92 ? (1 - k) / 0.08 : 1); petal(p, p.age); break;
        case "spark":
          ctx.fillStyle = p.col;
          star(p.x, p.y, p.size * (1 - k * 0.6) * (0.8 + 0.2 * Math.sin(p.age * 30)), p.rot + p.age * p.vr);
          break;
        case "dust":
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 - k), 0, Math.PI * 2); ctx.fill();
          break;
        case "confetti": {
          const flip = Math.cos(p.age * p.flipF + p.phase);
          ctx.save(); ctx.translate(p.x + Math.sin(p.age * 3 + p.phase) * 6 * unit, p.y);
          ctx.rotate(p.rot + p.age * p.vr); ctx.scale(1, flip);
          ctx.fillStyle = p.col; ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
          ctx.restore();
          break;
        }
        case "heart":
          ctx.fillStyle = p.col;
          heart(p.x + Math.sin(p.age * 2.4 + p.phase) * 8 * unit, p.y, p.size * (0.6 + 0.4 * Math.min(1, p.age * 4)), Math.sin(p.age * 2 + p.phase) * 0.3);
          break;
        case "crumb":
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.age * p.vr);
          ctx.fillStyle = p.col; ctx.beginPath();
          p.shape.forEach(([a, b], i) => (i ? ctx.lineTo(a * p.size, b * p.size) : ctx.moveTo(a * p.size, b * p.size)));
          ctx.closePath(); ctx.fill(); ctx.restore();
          break;
        case "rocket":
          ctx.strokeStyle = "rgba(243,227,187,0.85)"; ctx.lineWidth = 2 * unit; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); ctx.stroke();
          break;
        case "fw": {
          ctx.strokeStyle = k < 0.4 ? p.col[0] : p.col[1];
          ctx.lineWidth = p.size * (1 - k * 0.7); ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); ctx.stroke();
          if (p.twinkle && k > 0.5 && Math.random() < 0.5) { ctx.fillStyle = "#fff"; star(p.x, p.y, 2.2 * unit, 0); }
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    parts = next;
    if (parts.length) raf = requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, w, h); raf = 0; }
  }

  function burst(x, y, col) {
    const n = reducedMotion ? 0 : 72;
    const twinkle = Math.random() < 0.5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.05, 0.05);
      const sp = rnd(210, 300) * unit * (Math.random() < 0.25 ? 0.55 : 1);
      add({ kind: "fw", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 70 * unit, drag: 0.962, age: 0, life: rnd(1.2, 1.9), size: rnd(2, 3.2) * unit, col, twinkle });
    }
    for (let i = 0; i < 10; i++) add({ kind: "spark", x, y, vx: rnd(-60, 60) * unit, vy: rnd(-60, 60) * unit, drag: 0.92, age: 0, life: 0.6, size: 5 * unit, col: "#fff6dc", rot: rnd(0, 3), vr: 4 });
    start();
  }

  return {
    petals(count = 44) {
      resize();
      const n = reducedMotion ? 10 : count;
      const now = Math.ceil(n * 0.4);
      for (let i = 0; i < n; i++) {
        const first = i < now;
        const [c1, c2] = pick(Math.random() < 0.35 ? BLUE : IVORY);
        add({
          kind: "petal", x: Math.random() * w, y: first ? Math.random() * h * 0.55 : -20 - Math.random() * 40,
          age: -(first ? Math.random() * 0.25 : 0.3 + Math.random() * (reducedMotion ? 1.5 : 3)), life: 14, fadeIn: 0.25,
          size: rnd(10, 24) * unit, aspect: rnd(0.62, 0.87),
          vx: (Math.random() - 0.5) * 30 * unit, vy: rnd(120, 270) * (h / 800),
          sway: rnd(10, 38) * unit, swayF: rnd(0.6, 1.6), phase: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-1.5, 1.5), flipF: rnd(1, 3.2), c1, c2,
        });
      }
      start();
    },
    drift() {
      resize();
      for (let i = 0; i < (reducedMotion ? 4 : 12); i++) {
        const [c1, c2] = pick(BLUE);
        add({
          kind: "petal", x: rnd(0.1, 0.9) * w, y: -20 - Math.random() * 60, age: -Math.random() * 2.5, life: 16, fadeIn: 0.4,
          size: rnd(12, 20) * unit, aspect: rnd(0.62, 0.8), vx: (Math.random() - 0.5) * 12 * unit, vy: rnd(60, 95) * (h / 800),
          sway: rnd(18, 36) * unit, swayF: rnd(0.5, 0.9), phase: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-0.8, 0.8), flipF: rnd(0.8, 1.6), c1, c2,
        });
      }
      start();
    },
    sparkle(x, y, n = 12, spread = 1) {
      if (reducedMotion) return;
      resize();
      for (let i = 0; i < n; i++) {
        const a = rnd(0, Math.PI * 2), sp = rnd(40, 150) * unit * spread;
        add({ kind: "spark", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30 * unit, g: 40 * unit, drag: 0.94, age: -rnd(0, 0.08), life: rnd(0.55, 1.0), size: rnd(4, 9) * unit, col: pick(SPARK), rot: rnd(0, 3), vr: rnd(-3, 3) });
      }
      start();
    },
    dust(x, y) {
      if (reducedMotion) return;
      resize();
      for (let i = 0; i < 2; i++) {
        add({ kind: i ? "dust" : "spark", x: x + rnd(-6, 6), y: y + rnd(-6, 6), vx: rnd(-14, 14) * unit, vy: rnd(-26, 6) * unit, g: 10 * unit, age: 0, life: rnd(0.5, 0.9), size: (i ? rnd(1.6, 2.8) : rnd(3, 5.5)) * unit, col: pick(SPARK), rot: rnd(0, 3), vr: rnd(-2, 2), alpha: 0.95 });
      }
      start();
    },
    confetti(x, y, n = 90) {
      resize();
      const count = reducedMotion ? 0 : n;
      for (let i = 0; i < count; i++) {
        const a = rnd(-Math.PI * 0.92, -Math.PI * 0.08), sp = rnd(260, 620) * unit;
        add({ kind: "confetti", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 520 * unit, drag: 0.955, age: -rnd(0, 0.12), life: rnd(2.2, 3.4), size: rnd(8, 14) * unit, col: pick(CONFETTI), rot: rnd(0, 6), vr: rnd(-8, 8), flipF: rnd(6, 14), phase: rnd(0, 6) });
      }
      start();
    },
    hearts(x, y, n = 14) {
      resize();
      for (let i = 0; i < (reducedMotion ? 3 : n); i++) {
        add({ kind: "heart", x: x + rnd(-30, 30) * unit, y, vx: rnd(-50, 50) * unit, vy: rnd(-260, -120) * unit, g: 60 * unit, drag: 0.97, age: -rnd(0, 0.5), life: rnd(1.6, 2.6), size: rnd(16, 30) * unit, col: pick(HEARTS), phase: rnd(0, 6) });
      }
      start();
    },
    crumbs(x, y) {
      if (reducedMotion) return;
      resize();
      for (let i = 0; i < 16; i++) {
        const a = rnd(0, Math.PI * 2), sp = rnd(90, 260) * unit;
        const shape = Array.from({ length: 4 + (i % 2) }, (_, k) => { const t = (k / (4 + (i % 2))) * 6.28; const rr = rnd(0.5, 1); return [Math.cos(t) * rr, Math.sin(t) * rr]; });
        add({ kind: "crumb", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120 * unit, g: 900 * unit, drag: 0.99, age: 0, life: rnd(0.8, 1.3), size: rnd(3, 7) * unit, col: pick(["#7c2431", "#8f2f3c", "#5c1520", "#a9404c"]), shape, rot: rnd(0, 6), vr: rnd(-10, 10) });
      }
      this.sparkle(x, y, 10, 1.2);
    },
    firework(x, y) {
      if (reducedMotion) return;
      resize();
      const tx = x ?? rnd(0.18, 0.82) * w, ty = y ?? rnd(0.12, 0.42) * h;
      const sx = tx + rnd(-30, 30) * unit, sy = h + 10;
      const life = rnd(0.75, 1.0);
      // constant deceleration so it arrives at (tx, ty) as it slows
      const g = 2 * ((sy - ty) - 0) / (life * life) * 0.6;
      const vy = -((sy - ty) + 0.5 * g * life * life) / life;
      add({ kind: "rocket", x: sx, y: sy, vx: (tx - sx) / life, vy, g, age: 0, life, col: pick(FW) });
      start();
    },
    get busy() { return parts.length > 0; },
  };
}
