// Sizzle & Serve — the order board: spawning, patience, matching, scoring.
// One job: decide what customers want and what a served plate is worth.

import { MAX_ORDERS, ORDER_PATIENCE, RECIPES } from './config.js';

let nextOrderId = 1;

export function createOrderBoard(random) {
  const orders = [];

  function spawnOrder(now) {
    // Prefer a recipe not already on the board, so three tickets read as
    // three different jobs instead of three copies of one.
    const onBoard = new Set(orders.map((o) => o.recipe));
    const fresh = RECIPES.filter((r) => !onBoard.has(r.name));
    const pool = fresh.length > 0 ? fresh : RECIPES;
    const recipe = pool[Math.floor(random() * pool.length)];
    orders.push({
      id: nextOrderId++,
      recipe: recipe.name,
      stack: [...recipe.stack],
      points: recipe.points,
      bornAt: now,
      patience: ORDER_PATIENCE,
      served: false,
    });
  }

  function update(dt, now, onExpired) {
    for (const order of orders) {
      order.patience -= dt;
    }
    // Expired orders leave the board and cost a strike.
    for (let i = orders.length - 1; i >= 0; i--) {
      if (orders[i].patience <= 0) {
        const gone = orders.splice(i, 1)[0];
        onExpired(gone);
      }
    }
    while (orders.length < MAX_ORDERS) spawnOrder(now);
  }

  // Does this plate stack match an order, bottom-to-top, exactly?
  function findMatch(stack) {
    return orders.find((o) => stacksEqual(o.stack, stack)) ?? null;
  }

  function removeOrder(order) {
    const i = orders.indexOf(order);
    if (i >= 0) orders.splice(i, 1);
  }

  function reset(now) {
    orders.length = 0;
    nextOrderId = 1;
    for (let i = 0; i < MAX_ORDERS; i++) spawnOrder(now);
  }

  return { orders, update, findMatch, removeOrder, reset };
}

export function stacksEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// Points for a served order: base + patience bonus, scaled by the combo.
export function scoreServe(order, combo) {
  const patienceBonus = Math.round(60 * Math.max(0, order.patience / ORDER_PATIENCE));
  const comboBonus = (combo - 1) * 15;
  return order.points + patienceBonus + comboBonus;
}

// A plate that matches nothing still earns a little, and breaks the combo.
export function scoreTrashServe(stack) {
  return Math.max(0, stack.length * 5 - 10);
}
