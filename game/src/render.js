// Sizzle & Serve — everything the player sees, drawn on one canvas.
// One job: paint the kitchen, the food, the chef and the HUD, frame by frame.

import {
  VIEW_W, VIEW_H, STATIONS, PLATE, SERVE_WINDOW, TRASH,
  INGREDIENTS, GRILL_PERFECT_FROM, GRILL_PERFECT_TO, SHIFT_SECONDS,
} from './config.js';

const BG = '#2b1d16';
const FLOOR_A = '#8a5a3b';
const FLOOR_B = '#7d5136';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- food art: each ingredient drawn as a chunky top-down layer ---

export function drawIngredient(ctx, id, x, y, w) {
  const h = w * 0.42;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    rr(ctx, -w / 2, -h / 2, w, h, h / 2);
    ctx.fillStyle = INGREDIENTS.bun.color;
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    for (const [sx, sy] of [[-0.25, -0.12], [0.05, -0.18], [0.28, -0.05], [-0.05, 0.12], [0.22, 0.16]]) {
      ctx.beginPath();
      ctx.ellipse(sx * w, sy * h, w * 0.045, h * 0.09, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    rr(ctx, -w / 2, -h / 2, w, h, h / 2);
    ctx.fillStyle = INGREDIENTS.patty.color;
    ctx.fill();
    ctx.fillStyle = INGREDIENTS.patty.dark;
    for (const [sx, sy] of [[-0.3, 0], [0, -0.12], [0.28, 0.08], [0.1, 0.16]]) {
      ctx.beginPath();
      ctx.arc(sx * w, sy * h, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'salad') {
    ctx.fillStyle = INGREDIENTS.salad.color;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const px = -w / 2 + (i / 10) * w;
      const py = (i % 2 === 0 ? -h / 2 : -h / 2 + h * 0.28);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = 10; i >= 0; i--) {
      const px = -w / 2 + (i / 10) * w;
      const py = (i % 2 === 0 ? h / 2 : h / 2 - h * 0.28);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(w * 0.22, 0, h * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = INGREDIENTS.cheese.color;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = INGREDIENTS.cheese.dark;
    for (const [sx, sy] of [[-0.25, 0], [0.15, -0.1], [0.3, 0.12]]) {
      ctx.beginPath();
      ctx.arc(sx * w, sy * h, w * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'sauce') {
    ctx.strokeStyle = INGREDIENTS.sauce.color;
    ctx.lineWidth = h * 0.34;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w * 0.38, -h * 0.1);
    ctx.quadraticCurveTo(0, -h * 0.55, w * 0.38, -h * 0.05);
    ctx.quadraticCurveTo(0, h * 0.4, -w * 0.38, h * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStack(ctx, stack, x, y, w) {
  // Draw bottom-to-top so the top layer sits highest on screen.
  const layerH = w * 0.30;
  let cy = y + (stack.length * layerH) / 2 - layerH / 2;
  for (const id of stack) {
    drawIngredient(ctx, id, x, cy, w);
    cy -= layerH;
  }
}

// --- the chef ---

function drawChef(ctx, chef, now) {
  const bob = chef.moving ? Math.sin(chef.bobPhase) * 3 : 0;
  const x = chef.x;
  const y = chef.y + bob;
  ctx.save();
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, chef.y + 30, 30, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // body (apron)
  ctx.fillStyle = '#f4f1ea';
  rr(ctx, x - 22, y - 6, 44, 40, 12);
  ctx.fill();
  ctx.fillStyle = '#2f6db3';
  rr(ctx, x - 22, y - 6, 44, 12, 6);
  ctx.fill();
  // head
  ctx.fillStyle = '#f2c79b';
  ctx.beginPath();
  ctx.arc(x, y - 22, 17, 0, Math.PI * 2);
  ctx.fill();
  // toque
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 9, y - 36, 8, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 36, 8, 0, Math.PI * 2);
  ctx.arc(x, y - 40, 9, 0, Math.PI * 2);
  ctx.fill();
  rr(ctx, x - 14, y - 38, 28, 10, 4);
  ctx.fill();
  // eyes
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x - 6 * chef.facing, y - 24, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 5 * chef.facing, y - 24, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // held item above the head
  if (chef.carrying) {
    const held = chef.carrying === 'cooked-patty' ? 'patty' : chef.carrying === 'raw-patty' ? 'patty' : chef.carrying;
    const label = chef.carrying === 'raw-patty' ? 'RAW' : chef.carrying === 'burnt' ? 'BURNT' : null;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(x, y - 66, 22, 0, Math.PI * 2);
    ctx.fill();
    drawIngredient(ctx, held, x, y - 66, 34);
    if (label) text(ctx, label, x, y - 66, 11, '#fff');
  }
  ctx.restore();
  void now;
}

// --- the kitchen scene ---

function drawFloor(ctx) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // checkerboard floor
  const tile = 64;
  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(tx * tile, 216 + ty * tile, tile, tile);
    }
  }
  // back wall
  ctx.fillStyle = '#3d2b20';
  ctx.fillRect(0, 64, VIEW_W, 32);
  ctx.fillStyle = '#f7ead2';
  for (let x = 0; x < VIEW_W; x += 48) {
    ctx.fillRect(x + 4, 70, 40, 20);
  }
}

function drawStations(ctx, kitchen, chef) {
  for (const s of STATIONS) {
    const hovered = chef && Math.abs(chef.x - (s.x + s.w / 2)) < s.w / 2 + 30
      && chef.y - (s.y + s.h) > -10 && chef.y - (s.y + s.h) < 110;
    ctx.fillStyle = hovered ? '#5a3a22' : '#4a2f1d';
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    ctx.fillStyle = '#c98f4e';
    rr(ctx, s.x + 4, s.y + 4, s.w - 8, 22, 6);
    ctx.fill();
    text(ctx, s.label, s.x + s.w / 2, s.y + 15, 15, '#3a2412');
    if (s.id === 'grill') {
      // grill grate
      ctx.fillStyle = '#1d1d22';
      rr(ctx, s.x + 14, s.y + 36, s.w - 28, 48, 8);
      ctx.fill();
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(s.x + 14 + i * ((s.w - 28) / 5), s.y + 38);
        ctx.lineTo(s.x + 14 + i * ((s.w - 28) / 5), s.y + 82);
        ctx.stroke();
      }
      const g = kitchen.grill;
      if (g.state === 'cooking' || g.state === 'burnt') {
        drawIngredient(ctx, 'patty', s.x + s.w / 2, s.y + 60, 64);
        if (g.state === 'burnt') text(ctx, 'BURNT', s.x + s.w / 2, s.y + 60, 13, '#ff6b5e');
      }
      // grill timing bar
      if (g.state === 'cooking') {
        const bw = s.w - 28;
        const bx = s.x + 14;
        const by = s.y + s.h - 12;
        ctx.fillStyle = '#222';
        rr(ctx, bx, by, bw, 8, 4);
        ctx.fill();
        ctx.fillStyle = g.progress < GRILL_PERFECT_FROM ? '#e8b13c'
          : g.progress <= GRILL_PERFECT_TO ? '#57c465' : '#ff5a4e';
        rr(ctx, bx, by, bw * Math.min(1, g.progress), 8, 4);
        ctx.fill();
        // perfect window marker
        ctx.fillStyle = '#fff';
        ctx.fillRect(bx + bw * GRILL_PERFECT_FROM, by - 3, 2, 14);
        ctx.fillRect(bx + bw * GRILL_PERFECT_TO, by - 3, 2, 14);
      }
    } else {
      drawIngredient(ctx, s.ingredient, s.x + s.w / 2, s.y + 62, 76);
    }
  }
}

function drawPlateArea(ctx, kitchen) {
  // assembly plate
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y + 14, PLATE.r + 8, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7f3ea';
  ctx.beginPath();
  ctx.arc(PLATE.x, PLATE.y, PLATE.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9b98f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(PLATE.x, PLATE.y, PLATE.r - 8, 0, Math.PI * 2);
  ctx.stroke();
  if (kitchen.plate.length > 0) {
    drawStack(ctx, kitchen.plate, PLATE.x, PLATE.y - 6, 120);
  } else {
    text(ctx, 'PLATE', PLATE.x, PLATE.y, 20, '#b8a888');
  }
  text(ctx, 'ASSEMBLY PLATE', PLATE.x, PLATE.y + PLATE.r + 26, 14, '#f7ead2');

  // serve window
  ctx.fillStyle = '#3a2412';
  rr(ctx, SERVE_WINDOW.x, SERVE_WINDOW.y, SERVE_WINDOW.w, SERVE_WINDOW.h, 12);
  ctx.fill();
  ctx.fillStyle = '#f7ead2';
  rr(ctx, SERVE_WINDOW.x + 10, SERVE_WINDOW.y + 10, SERVE_WINDOW.w - 20, 96, 8);
  ctx.fill();
  text(ctx, 'SERVE', SERVE_WINDOW.x + SERVE_WINDOW.w / 2, SERVE_WINDOW.y + 34, 22, '#3a2412');
  // bell
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.arc(SERVE_WINDOW.x + SERVE_WINDOW.w / 2, SERVE_WINDOW.y + 76, 16, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(SERVE_WINDOW.x + SERVE_WINDOW.w / 2 - 18, SERVE_WINDOW.y + 74, 36, 5);
  text(ctx, 'WINDOW', SERVE_WINDOW.x + SERVE_WINDOW.w / 2, SERVE_WINDOW.y + 128, 14, '#f7ead2');
  text(ctx, 'click plate, then serve', SERVE_WINDOW.x + SERVE_WINDOW.w / 2, SERVE_WINDOW.y + 158, 12, '#c9b98f');
  text(ctx, 'when it matches a ticket', SERVE_WINDOW.x + SERVE_WINDOW.w / 2, SERVE_WINDOW.y + 178, 12, '#c9b98f');

  // trash
  ctx.fillStyle = '#33302e';
  rr(ctx, TRASH.x, TRASH.y, TRASH.w, TRASH.h, 10);
  ctx.fill();
  ctx.fillStyle = '#777';
  rr(ctx, TRASH.x + 8, TRASH.y + 8, TRASH.w - 16, 14, 6);
  ctx.fill();
  text(ctx, 'TRASH', TRASH.x + TRASH.w / 2, TRASH.y + TRASH.h / 2 + 12, 15, '#ddd');
}

// --- order tickets and HUD ---

function drawOrders(ctx, orders) {
  text(ctx, 'ORDERS', 24, 22, 15, '#f7ead2', 'left');
  orders.forEach((order, i) => {
    const x = 24 + i * 208;
    const y = 34;
    const w = 196;
    const h = 56;
    const pct = Math.max(0, order.patience / 45);
    ctx.fillStyle = '#f7ead2';
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = pct > 0.5 ? '#57c465' : pct > 0.25 ? '#e8b13c' : '#ff5a4e';
    rr(ctx, x, y, w * pct, 6, 3);
    ctx.fill();
    text(ctx, order.recipe.toUpperCase(), x + 10, y + 22, 14, '#3a2412', 'left');
    text(ctx, `${order.points} pts`, x + w - 10, y + 22, 12, '#7a5a34', 'right');
    // recipe stack, small, left to right bottom-to-top
    let ix = x + 22;
    for (const id of order.stack) {
      drawIngredient(ctx, id, ix, y + 40, 26);
      ix += 30;
    }
    text(ctx, `${Math.ceil(order.patience)}s`, x + w - 12, y + 44, 12, '#7a5a34', 'right');
  });
}

function drawHud(ctx, game) {
  const remain = Math.max(0, SHIFT_SECONDS - game.elapsed);
  const mm = String(Math.floor(remain / 60)).padStart(2, '0');
  const ss = String(Math.floor(remain % 60)).padStart(2, '0');
  text(ctx, `TIME ${mm}:${ss}`, 640, 22, 22, remain <= 15 ? '#ff6b5e' : '#f7ead2');
  // shift progress bar
  ctx.fillStyle = '#1d1410';
  rr(ctx, 520, 38, 240, 8, 4);
  ctx.fill();
  ctx.fillStyle = '#57c465';
  rr(ctx, 520, 38, 240 * (game.elapsed / SHIFT_SECONDS), 8, 4);
  ctx.fill();

  text(ctx, `SCORE ${game.score}`, 1256, 20, 20, '#ffd166', 'right');
  text(ctx, game.combo > 1 ? `COMBO x${game.combo}` : 'COMBO —', 1256, 44, 14, game.combo > 1 ? '#ff9f43' : '#c9b98f', 'right');
  text(ctx, `STRIKES ${'✕'.repeat(game.strikes)}${'·'.repeat(3 - game.strikes)}`, 900, 20, 14, '#ff8a7a', 'right');
  if (game.servedCount > 0) text(ctx, `SERVED ${game.servedCount}`, 900, 44, 14, '#a8e6a1', 'right');

  if (game.flash) {
    text(ctx, game.flash.text, 640, 260, 30, game.flash.color);
  }
}

// --- overlays ---

function dim(ctx) {
  ctx.fillStyle = 'rgba(20,12,8,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawTitle(ctx) {
  dim(ctx);
  text(ctx, 'SIZZLE & SERVE', 640, 190, 64, '#ffd166');
  text(ctx, 'a rush-hour burger kitchen', 640, 240, 22, '#f7ead2');
  text(ctx, 'Cook every ticket before its patience runs out.', 640, 300, 18, '#c9b98f');
  text(ctx, 'WASD / arrows to move  •  E or click a station to grab', 640, 340, 17, '#f7ead2');
  text(ctx, 'Click the plate to stack  •  grill patties in the green zone', 640, 368, 17, '#f7ead2');
  text(ctx, 'Space serves at the window  •  P pauses  •  M mutes', 640, 396, 17, '#f7ead2');
  text(ctx, 'PRESS ENTER OR CLICK TO START', 640, 470, 22, '#57c465');
  text(ctx, '120-second shift  •  3 strikes and the kitchen closes', 640, 520, 15, '#c9b98f');
}

function drawPaused(ctx) {
  dim(ctx);
  text(ctx, 'PAUSED', 640, 330, 56, '#f7ead2');
  text(ctx, 'Press P or click to keep cooking', 640, 390, 18, '#c9b98f');
}

function drawGameOver(ctx, game) {
  dim(ctx);
  text(ctx, 'SHIFT OVER', 640, 210, 56, '#ffd166');
  text(ctx, `SCORE  ${game.score}`, 640, 290, 34, '#f7ead2');
  text(ctx, `Dishes served: ${game.servedCount}    Best combo: x${game.bestCombo}`, 640, 340, 20, '#c9b98f');
  text(ctx, game.strikes >= 3 ? 'The kitchen closed early — too many tickets walked out.'
    : 'The rush is done. The kitchen is yours again tomorrow.', 640, 380, 17, '#f7ead2');
  text(ctx, 'PRESS R OR CLICK TO COOK AGAIN', 640, 460, 22, '#57c465');
}

// --- frame entry point ---

export function renderFrame(ctx, game, chef, kitchen, orders) {
  drawFloor(ctx);
  drawStations(ctx, kitchen, chef);
  drawPlateArea(ctx, kitchen);
  drawChef(ctx, chef, performance.now());
  drawOrders(ctx, orders);
  drawHud(ctx, game);
  if (game.phase === 'title') drawTitle(ctx);
  if (game.phase === 'paused') drawPaused(ctx);
  if (game.phase === 'over') drawGameOver(ctx, game);
}
