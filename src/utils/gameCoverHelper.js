import { BUILT_IN_GAMES } from "../data/builtInGames";

export const getBuiltInGameByTitle = (title) => {
  if (!title) return null;
  const lower = String(title).trim().toLowerCase();
  return BUILT_IN_GAMES.find((g) => g.title.toLowerCase() === lower) || null;
};

const coverDataUrlCache = new Map();

const drawStar = (ctx, cx, cy, spikes, outerR, innerR, color) => {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

const drawHeart = (ctx, cx, cy, size, color) => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.3);
  ctx.bezierCurveTo(cx - size * 0.6, cy - size * 0.35, cx - size, cy + size * 0.25, cx, cy + size * 0.85);
  ctx.bezierCurveTo(cx + size, cy + size * 0.25, cx + size * 0.6, cy - size * 0.35, cx, cy + size * 0.3);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
};

const drawGameScene = (ctx, game, w, h) => {
  const id = game?.id || "g01";
  const cx = w / 2;
  const cy = h / 2;

  // Background gradients per game
  const bg = ctx.createLinearGradient(0, 0, w, h);
  switch (id) {
    case "g01": // 4-7-8 Calm Breathing Bubble
      bg.addColorStop(0, "#064e3b");
      bg.addColorStop(1, "#10b981");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      [84, 62, 42].forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 243, 208, ${0.15 + idx * 0.14})`;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.stroke();
      });
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 20px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("4 · 7 · 8", cx, cy);
      break;

    case "g02": // Stress Bubble Pop
      bg.addColorStop(0, "#0c4a6e");
      bg.addColorStop(1, "#38bdf8");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      [
        [cx - 85, cy - 20, 34, "#bae6fd"],
        [cx - 10, cy + 12, 46, "#fbcfe8"],
        [cx + 80, cy - 18, 38, "#a7f3d0"],
        [cx + 32, cy - 58, 22, "#fde68a"],
        [cx - 48, cy + 52, 24, "#ddd6fe"],
      ].forEach(([bx, by, r, col]) => {
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = col;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx - r * 0.3, by - r * 0.3, r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      });
      break;

    case "g03": // Gratitude Garden
      bg.addColorStop(0, "#065f46");
      bg.addColorStop(1, "#34d399");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      // Ground hill
      ctx.fillStyle = "#047857";
      ctx.beginPath();
      ctx.ellipse(cx, h - 10, w * 0.6, 55, 0, Math.PI, 0, true);
      ctx.fill();
      // 3 flowers
      [
        [cx - 75, cy + 10, "#f472b6", 18],
        [cx, cy - 8, "#fbbf24", 24],
        [cx + 75, cy + 12, "#a78bfa", 18],
      ].forEach(([fx, fy, petalCol, pr]) => {
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx, h - 24);
        ctx.stroke();
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(ang) * pr * 0.8, fy + Math.sin(ang) * pr * 0.8, pr * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = petalCol;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(fx, fy, pr * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "#fef08a";
        ctx.fill();
      });
      break;

    case "g04": // Zen Pond Ripples
      bg.addColorStop(0, "#0f172a");
      bg.addColorStop(1, "#0d9488");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      [82, 56, 32].forEach((r, i) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, r * 1.4, r * 0.65, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94, 234, 212, ${0.25 + i * 0.25})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      });
      // Lotus dot
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#f9a8d4";
      ctx.fill();
      break;

    case "g05": // Positive Thought Catcher
      bg.addColorStop(0, "#064e3b");
      bg.addColorStop(1, "#0284c7");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      drawStar(ctx, cx - 75, cy - 45, 5, 18, 8, "#fde047");
      drawStar(ctx, cx + 80, cy - 35, 5, 16, 7, "#a7f3d0");
      drawHeart(ctx, cx, cy - 52, 20, "#fb7185");
      // Catcher bowl
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(cx - 56, cy + 36, 112, 22, 11);
      ctx.fill();
      break;

    case "g06": // Zen Sand Garden
      bg.addColorStop(0, "#92400e");
      bg.addColorStop(1, "#f59e0b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      // Raked sand wave lines
      ctx.strokeStyle = "rgba(254, 243, 199, 0.45)";
      ctx.lineWidth = 3;
      for (let y = 32; y < h; y += 22) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 15) {
          const wy = y + Math.sin(x * 0.04) * 6;
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }
      // Zen stones
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy + 12, 34, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.ellipse(cx + 28, cy + 20, 22, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "g07": // Worry Cloud Release
      bg.addColorStop(0, "#1e3a8a");
      bg.addColorStop(1, "#60a5fa");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      // Fluffy clouds
      const drawCloud = (x, y, s, col) => {
        ctx.fillStyle = col;
        [
          [x, y, 24 * s],
          [x - 22 * s, y + 6 * s, 18 * s],
          [x + 22 * s, y + 6 * s, 18 * s],
        ].forEach(([px, py, r]) => {
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        });
      };
      drawCloud(cx - 55, cy + 10, 1.1, "rgba(255,255,255,0.85)");
      drawCloud(cx + 55, cy - 22, 1.3, "rgba(255,255,255,0.95)");
      break;

    case "g08": // Mindful Mandala Colorer
      bg.addColorStop(0, "#3b0764");
      bg.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const colors = ["#f472b6", "#38bdf8", "#34d399", "#fbbf24"];
      for (let ring = 2; ring >= 0; ring--) {
        const count = 8 + ring * 4;
        const rad = 26 + ring * 24;
        for (let i = 0; i < count; i++) {
          const ang = (i * Math.PI * 2) / count;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 11, 0, Math.PI * 2);
          ctx.fillStyle = colors[(i + ring) % colors.length];
          ctx.fill();
        }
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#fef08a";
      ctx.fill();
      break;

    case "g09": // Starlight Constellation
      bg.addColorStop(0, "#0f172a");
      bg.addColorStop(1, "#312e81");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const pts = [
        [cx - 95, cy + 25],
        [cx - 42, cy - 35],
        [cx + 12, cy - 8],
        [cx + 58, cy - 45],
        [cx + 98, cy + 18],
      ];
      ctx.strokeStyle = "rgba(199, 210, 254, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
      pts.forEach(([x, y]) => drawStar(ctx, x, y, 5, 10, 4.5, "#fde047"));
      break;

    case "g10": // Calm Heartbeat Sync
      bg.addColorStop(0, "#881337");
      bg.addColorStop(1, "#f43f5e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      drawHeart(ctx, cx, cy - 28, 46, "rgba(255,255,255,0.92)");
      // Pulse wave
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + 46);
      ctx.lineTo(cx - 40, cy + 46);
      ctx.lineTo(cx - 22, cy + 22);
      ctx.lineTo(cx, cy + 64);
      ctx.lineTo(cx + 22, cy + 18);
      ctx.lineTo(cx + 40, cy + 46);
      ctx.lineTo(cx + 120, cy + 46);
      ctx.stroke();
      break;

    case "g11": // Zen Memory Match
      bg.addColorStop(0, "#065f46");
      bg.addColorStop(1, "#10b981");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const cardColors = ["#ffffff", "#a7f3d0", "#ffffff", "#fde68a", "#a7f3d0", "#ffffff"];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const x = cx - 96 + c * 68;
          const y = cy - 58 + r * 62;
          ctx.fillStyle = cardColors[r * 3 + c];
          ctx.beginPath();
          ctx.roundRect(x, y, 56, 52, 10);
          ctx.fill();
          if (r * 3 + c === 0 || r * 3 + c === 5) {
            drawStar(ctx, x + 28, y + 26, 5, 12, 5, "#059669");
          }
        }
      }
      break;

    case "g12": // Calm Tic-Tac-Toe
      bg.addColorStop(0, "#0369a1");
      bg.addColorStop(1, "#38bdf8");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      // 3x3 Grid
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      [cx - 32, cx + 32].forEach((gx) => {
        ctx.beginPath();
        ctx.moveTo(gx, cy - 75);
        ctx.lineTo(gx, cy + 75);
        ctx.stroke();
      });
      [cy - 25, cy + 25].forEach((gy) => {
        ctx.beginPath();
        ctx.moveTo(cx - 82, gy);
        ctx.lineTo(cx + 82, gy);
        ctx.stroke();
      });
      // X and O
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 62);
      ctx.lineTo(cx - 44, cy - 36);
      ctx.moveTo(cx - 44, cy - 62);
      ctx.lineTo(cx - 70, cy - 36);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#fde047";
      ctx.beginPath();
      ctx.moveTo(cx + 44, cy + 36);
      ctx.lineTo(cx + 70, cy + 62);
      ctx.moveTo(cx + 70, cy + 36);
      ctx.lineTo(cx + 44, cy + 62);
      ctx.stroke();
      break;

    case "g13": // Color Sort Tubes
      bg.addColorStop(0, "#1e293b");
      bg.addColorStop(1, "#0B8843");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const tubes = [
        ["#ef4444", "#3b82f6", "#fbbf24"],
        ["#3b82f6", "#10b981", "#ef4444"],
        ["#10b981", "#fbbf24", "#3b82f6"],
        ["#fbbf24", "#ef4444", "#10b981"],
      ];
      tubes.forEach((balls, ti) => {
        const tx = cx - 98 + ti * 65;
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(tx - 18, cy - 62, 36, 124, [4, 4, 18, 18]);
        ctx.stroke();
        balls.forEach((bCol, bi) => {
          ctx.beginPath();
          ctx.arc(tx, cy + 40 - bi * 32, 12, 0, Math.PI * 2);
          ctx.fillStyle = bCol;
          ctx.fill();
        });
      });
      break;

    case "g14": // Zen 2048
      bg.addColorStop(0, "#064e3b");
      bg.addColorStop(1, "#059669");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const tiles = [
        ["2", "#d1fae5", "#065f46"],
        ["8", "#6ee7b7", "#064e3b"],
        ["64", "#10b981", "#ffffff"],
        ["2048", "#fbbf24", "#78350f"],
      ];
      tiles.forEach(([num, bgC, fgC], idx) => {
        const r = Math.floor(idx / 2);
        const c = idx % 2;
        const x = cx - 78 + c * 82;
        const y = cy - 72 + r * 76;
        ctx.fillStyle = bgC;
        ctx.beginPath();
        ctx.roundRect(x, y, 72, 66, 12);
        ctx.fill();
        ctx.fillStyle = fgC;
        ctx.font = "800 22px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(num, x + 36, y + 33);
      });
      break;

    case "g15": // Calm Tile Slider
      bg.addColorStop(0, "#065f46");
      bg.addColorStop(1, "#14b8a6");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const nums = ["1", "2", "3", "4", "5", "6", "7", "8", ""];
      nums.forEach((n, idx) => {
        if (!n) return;
        const r = Math.floor(idx / 3);
        const c = idx % 3;
        const x = cx - 75 + c * 52;
        const y = cy - 75 + r * 52;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(x, y, 46, 46, 8);
        ctx.fill();
        ctx.fillStyle = "#0B8843";
        ctx.font = "800 20px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n, x + 23, y + 23);
      });
      break;

    case "g16": // Pastel Brick Breaker
      bg.addColorStop(0, "#0c4a6e");
      bg.addColorStop(1, "#0284c7");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const brickCols = ["#fda4af", "#fde047", "#6ee7b7", "#93c5fd"];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.fillStyle = brickCols[(r + c) % brickCols.length];
          ctx.beginPath();
          ctx.roundRect(cx - 120 + c * 49, cy - 70 + r * 22, 43, 16, 4);
          ctx.fill();
        }
      }
      ctx.beginPath();
      ctx.arc(cx + 15, cy + 20, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.fillStyle = "#bae6fd";
      ctx.beginPath();
      ctx.roundRect(cx - 48, cy + 56, 96, 12, 6);
      ctx.fill();
      break;

    case "g17": // Meadow Snake
      bg.addColorStop(0, "#064e3b");
      bg.addColorStop(1, "#22c55e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      [
        [cx - 80, cy + 25],
        [cx - 50, cy + 25],
        [cx - 20, cy + 25],
        [cx - 20, cy - 5],
        [cx + 10, cy - 5],
        [cx + 40, cy - 5],
      ].forEach(([sx, sy], idx) => {
        ctx.fillStyle = idx === 5 ? "#bbf7d0" : "#4ade80";
        ctx.beginPath();
        ctx.roundRect(sx - 13, sy - 13, 26, 26, 7);
        ctx.fill();
      });
      // Apple
      ctx.beginPath();
      ctx.arc(cx + 90, cy - 5, 13, 0, Math.PI * 2);
      ctx.fillStyle = "#f43f5e";
      ctx.fill();
      break;

    case "g18": // Color Sequence Memory (Simon)
      bg.addColorStop(0, "#312e81");
      bg.addColorStop(1, "#7c3aed");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const simonCols = ["#ef4444", "#3b82f6", "#fbbf24", "#10b981"];
      simonCols.forEach((col, i) => {
        const a0 = i * (Math.PI / 2) + 0.08;
        const a1 = (i + 1) * (Math.PI / 2) - 0.08;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 78, a0, a1);
        ctx.closePath();
        ctx.fillStyle = col;
        ctx.fill();
      });
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fillStyle = "#1e1b4b";
      ctx.fill();
      break;

    case "g19": // Pop the Gloom
      bg.addColorStop(0, "#78350f");
      bg.addColorStop(1, "#f59e0b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      [-78, 0, 78].forEach((ox, idx) => {
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + 42, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        if (idx === 1) {
          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          ctx.arc(cx, cy + 8, 26, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#cbd5e1";
          ctx.beginPath();
          ctx.arc(cx + ox, cy + 16, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      break;

    case "g20": // Peaceful Sky Glider
    default:
      bg.addColorStop(0, "#0284c7");
      bg.addColorStop(1, "#bae6fd");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      // Pillars
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.roundRect(cx + 42, 0, 38, 72, 6);
      ctx.roundRect(cx + 42, h - 68, 38, 68, 6);
      ctx.fill();
      // Bird
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx - 42, cy, 24, 17, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 3);
      ctx.lineTo(cx - 6, cy + 2);
      ctx.lineTo(cx - 18, cy + 7);
      ctx.closePath();
      ctx.fill();
      break;
  }
};

export const generateGameCoverFile = (game) =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 280;
    drawGameScene(canvas.getContext("2d"), game, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const safeName = (game?.id || "game-cover").replace(/[^a-z0-9-_]/gi, "-");
        resolve(new File([blob], `${safeName}-cover.png`, { type: "image/png" }));
      },
      "image/png"
    );
  });

export const getGameCoverDataUrl = (game) => {
  if (typeof document === "undefined" || !game) return null;
  if (coverDataUrlCache.has(game.id)) {
    return coverDataUrlCache.get(game.id);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 280;
  drawGameScene(canvas.getContext("2d"), game, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/png");
  coverDataUrlCache.set(game.id, url);
  return url;
};
