// Sizzle & Serve — deterministic screenshot scenes via ?shot=.
// One job: build a fixed, readable game state for each screenshot name.

import { RECIPES } from './config.js';

// A tiny seeded random so shot scenes are identical every run.
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Build the exact state a ?shot= value asks for. Returns the scene name.
export function applyShot(game, chef, kitchen, orderBoard, params) {
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number(params.get('seed') || 1);
  const random = seededRandom(seed);

  if (shot === 'start') {
    game.phase = 'title';
    game.elapsed = 0;
    game.score = 0;
    orderBoard.reset(0);
    return 'start';
  }

  if (shot === 'play') {
    game.phase = 'playing';
    game.elapsed = 43;
    game.score = 320;
    game.combo = 3;
    game.bestCombo = 3;
    game.servedCount = 4;
    game.strikes = 0;
    orderBoard.reset(0);
    orderBoard.orders[0].recipe = 'Classic';
    orderBoard.orders[0].stack = [...RECIPES[0].stack];
    orderBoard.orders[0].points = RECIPES[0].points;
    orderBoard.orders[0].patience = 31;
    orderBoard.orders[1].recipe = 'Cheesy';
    orderBoard.orders[1].stack = [...RECIPES[1].stack];
    orderBoard.orders[1].points = RECIPES[1].points;
    orderBoard.orders[1].patience = 18;
    orderBoard.orders[2].recipe = 'Garden';
    orderBoard.orders[2].stack = [...RECIPES[2].stack];
    orderBoard.orders[2].points = RECIPES[2].points;
    orderBoard.orders[2].patience = 9;
    // Dish mid-assembly: bun + patty already stacked.
    kitchen.plate = ['bun', 'patty'];
    // A patty on the grill, deep in the green zone.
    kitchen.grill = { state: 'cooking', progress: 0.72 };
    // The chef stands by the cheese station, carrying cheese.
    chef.x = 830;
    chef.y = 300;
    chef.carrying = 'cheese';
    chef.facing = -1;
    return 'play';
  }

  if (shot === 'serve') {
    game.phase = 'playing';
    game.elapsed = 68;
    game.score = 540;
    game.combo = 4;
    game.bestCombo = 4;
    game.servedCount = 6;
    game.strikes = 0;
    orderBoard.reset(0);
    orderBoard.orders[0].recipe = 'Classic';
    orderBoard.orders[0].stack = [...RECIPES[0].stack];
    orderBoard.orders[0].points = RECIPES[0].points;
    orderBoard.orders[0].patience = 24;
    orderBoard.orders[1].recipe = 'Double';
    orderBoard.orders[1].stack = [...RECIPES[3].stack];
    orderBoard.orders[1].points = RECIPES[3].points;
    orderBoard.orders[1].patience = 36;
    orderBoard.orders[2].recipe = 'Sunrise';
    orderBoard.orders[2].stack = [...RECIPES[4].stack];
    orderBoard.orders[2].points = RECIPES[4].points;
    orderBoard.orders[2].patience = 12;
    // A complete Classic, ready on the plate at the window.
    kitchen.plate = ['bun', 'patty', 'salad'];
    kitchen.grill = { state: 'empty', progress: 0 };
    chef.x = 1010;
    chef.y = 460;
    chef.carrying = null;
    chef.facing = 1;
    game.flash = { text: 'READY TO SERVE!', color: '#57c465', until: performance.now() + 60000 };
    return 'serve';
  }

  if (shot === 'end') {
    game.phase = 'over';
    game.elapsed = 120;
    game.score = 1240;
    game.combo = 1;
    game.bestCombo = 5;
    game.servedCount = 11;
    game.strikes = 1;
    orderBoard.reset(0);
    kitchen.plate = ['bun', 'patty'];
    kitchen.grill = { state: 'empty', progress: 0 };
    chef.x = 640;
    chef.y = 420;
    return 'end';
  }

  void random;
  return null;
}

// After the first painted frame, tell the screenshot runner the scene is ready.
export function markShotReady() {
  window.__shotReady = true;
}
