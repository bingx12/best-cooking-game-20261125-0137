// Sizzle & Serve — shared constants, recipes and station layout.
// One job: every number and name the rest of the game agrees on.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const SHIFT_SECONDS = 120;
export const MAX_ORDERS = 3;
export const MAX_STRIKES = 3;
export const ORDER_PATIENCE = 45;

export const CHEF_SPEED = 340;
export const CHEF_RADIUS = 26;

// Ingredient ids, in the order they stack on a plate (bun always first).
export const INGREDIENTS = {
  bun:    { name: 'Bun',    color: '#e8b06a', dark: '#b97f3e' },
  patty:  { name: 'Patty',  color: '#7a4a28', dark: '#54301a' },
  salad:  { name: 'Salad',  color: '#7fc24f', dark: '#4e8a2c' },
  cheese: { name: 'Cheese', color: '#f7c948', dark: '#d9a41f' },
  sauce:  { name: 'Sauce',  color: '#e8722a', dark: '#b34d12' },
};

// Recipes: name, the stack bottom-to-top, and the base points for serving it.
export const RECIPES = [
  { name: 'Classic', stack: ['bun', 'patty', 'salad'],          points: 100 },
  { name: 'Cheesy',  stack: ['bun', 'patty', 'cheese', 'sauce'], points: 130 },
  { name: 'Garden',  stack: ['bun', 'salad', 'cheese'],          points: 110 },
  { name: 'Double',  stack: ['bun', 'patty', 'patty', 'cheese'], points: 160 },
  { name: 'Sunrise', stack: ['bun', 'patty', 'salad', 'sauce'],  points: 140 },
];

// Grill timing: a patty is perfect inside this window, burnt after it.
export const GRILL_PERFECT_FROM = 0.55;
export const GRILL_PERFECT_TO = 0.85;
export const GRILL_BURNT_AT = 1.0;
export const GRILL_SECONDS = 6;

// Stations across the back counter. x/y are the counter block's top-left.
export const STATIONS = [
  { id: 'bun',    label: 'BUNS',   x: 40,   y: 96,  w: 180, h: 96, ingredient: 'bun' },
  { id: 'grill',  label: 'GRILL',  x: 260,  y: 96,  w: 220, h: 96, ingredient: 'patty' },
  { id: 'salad',  label: 'SALAD',  x: 520,  y: 96,  w: 180, h: 96, ingredient: 'salad' },
  { id: 'cheese', label: 'CHEESE', x: 740,  y: 96,  w: 180, h: 96, ingredient: 'cheese' },
  { id: 'sauce',  label: 'SAUCE',  x: 960,  y: 96,  w: 180, h: 96, ingredient: 'sauce' },
];

// The assembly plate and the serving window.
export const PLATE = { x: 640, y: 520, r: 96 };
export const SERVE_WINDOW = { x: 1060, y: 330, w: 180, h: 220 };
export const TRASH = { x: 60, y: 560, w: 110, h: 90 };

// Floor area the chef may walk in (below the back counter).
export const FLOOR = { x: 24, y: 216, w: 1232, h: 480 };

export function recipeByName(name) {
  return RECIPES.find((r) => r.name === name);
}

export function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}
