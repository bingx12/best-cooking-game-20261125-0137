// Sizzle & Serve — the chef: position, walking and what they carry.
// One job: move the chef (keys or click-to-walk) and track the held item.

import { CHEF_SPEED, CHEF_RADIUS, FLOOR } from './config.js';

export function createChef() {
  const chef = {
    x: 640,
    y: 420,
    facing: 1, // 1 right, -1 left
    carrying: null, // ingredient id, or 'raw-patty' / 'cooked-patty' / 'burnt'
    walkTarget: null, // {x, y} set by a mouse click; cleared on arrival
    moving: false,
    bobPhase: 0,
  };

  function clampToFloor() {
    chef.x = Math.max(FLOOR.x + CHEF_RADIUS, Math.min(FLOOR.x + FLOOR.w - CHEF_RADIUS, chef.x));
    chef.y = Math.max(FLOOR.y + CHEF_RADIUS, Math.min(FLOOR.y + FLOOR.h - CHEF_RADIUS, chef.y));
  }

  function update(dt, moveX, moveY) {
    chef.moving = false;
    if (moveX !== 0 || moveY !== 0) {
      chef.walkTarget = null; // keys override click-to-walk
      chef.x += moveX * CHEF_SPEED * dt;
      chef.y += moveY * CHEF_SPEED * dt;
      chef.facing = moveX < 0 ? -1 : moveX > 0 ? 1 : chef.facing;
      chef.moving = true;
    } else if (chef.walkTarget) {
      const dx = chef.walkTarget.x - chef.x;
      const dy = chef.walkTarget.y - chef.y;
      const dist = Math.hypot(dx, dy);
      const step = CHEF_SPEED * dt;
      if (dist <= step + 2) {
        chef.x = chef.walkTarget.x;
        chef.y = chef.walkTarget.y;
        chef.walkTarget = null;
      } else {
        chef.x += (dx / dist) * step;
        chef.y += (dy / dist) * step;
        chef.facing = dx < 0 ? -1 : 1;
        chef.moving = true;
      }
    }
    clampToFloor();
    if (chef.moving) chef.bobPhase += dt * 12;
  }

  function setWalkTarget(point) {
    chef.walkTarget = {
      x: Math.max(FLOOR.x + CHEF_RADIUS, Math.min(FLOOR.x + FLOOR.w - CHEF_RADIUS, point.x)),
      y: Math.max(FLOOR.y + CHEF_RADIUS, Math.min(FLOOR.y + FLOOR.h - CHEF_RADIUS, point.y)),
    };
  }

  function reset() {
    chef.x = 640;
    chef.y = 420;
    chef.facing = 1;
    chef.carrying = null;
    chef.walkTarget = null;
    chef.moving = false;
  }

  return { chef, update, setWalkTarget, reset };
}
