// Sizzle & Serve — stations, the grill, the plate and the serving window.
// One job: the kitchen's rules — what an interaction at each spot does.

import {
  STATIONS, PLATE, SERVE_WINDOW, TRASH,
  GRILL_SECONDS, GRILL_PERFECT_FROM, GRILL_PERFECT_TO, GRILL_BURNT_AT,
  stationById,
} from './config.js';
import { sfx } from './audio.js';

export function createKitchen() {
  const kitchen = {
    grill: { state: 'empty', progress: 0 }, // empty | cooking | done | burnt
    plate: [], // ingredient ids stacked bottom-to-top
    flash: null, // {text, color, until} floating feedback
  };

  function showFlash(text, color) {
    kitchen.flash = { text, color, until: performance.now() + 1400 };
  }

  function grillProgress(dt) {
    if (kitchen.grill.state === 'cooking') {
      kitchen.grill.progress += dt / GRILL_SECONDS;
      if (kitchen.grill.progress >= GRILL_BURNT_AT) {
        kitchen.grill.state = 'burnt';
        kitchen.grill.progress = GRILL_BURNT_AT;
        showFlash('BURNT!', '#ff5a4e');
        sfx.error();
      }
    }
  }

  // A patty is ready when its grill progress sits inside the perfect window.
  function pattyReady() {
    const g = kitchen.grill;
    return g.state === 'cooking'
      && g.progress >= GRILL_PERFECT_FROM
      && g.progress <= GRILL_PERFECT_TO;
  }

  function stationAt(point) {
    return STATIONS.find((s) =>
      point.x >= s.x && point.x <= s.x + s.w && point.y >= s.y && point.y <= s.y + s.h,
    ) ?? null;
  }

  function nearStation(chef) {
    // The chef interacts with a station when standing just below it.
    for (const s of STATIONS) {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h;
      if (Math.abs(chef.x - cx) < s.w / 2 + 30 && chef.y - cy > -10 && chef.y - cy < 110) return s;
    }
    return null;
  }

  function pointInRect(point, r) {
    return point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h;
  }

  function plateHit(point) {
    return Math.hypot(point.x - PLATE.x, point.y - PLATE.y) <= PLATE.r + 14;
  }

  // Interact with a station. Returns true when something happened.
  function interactStation(station, chef) {
    if (chef.carrying && station.id !== 'grill') {
      showFlash('HANDS FULL', '#ffd166');
      sfx.error();
      return false;
    }
    switch (station.id) {
      case 'bun':
      case 'salad':
      case 'cheese':
      case 'sauce': {
        chef.carrying = station.ingredient;
        sfx.pickup();
        return true;
      }
      case 'grill': {
        const g = kitchen.grill;
        if (g.state === 'empty') {
          if (chef.carrying === 'raw-patty') {
            g.state = 'cooking';
            g.progress = 0;
            chef.carrying = null;
            sfx.sizzleStart();
            return true;
          }
          chef.carrying = 'raw-patty';
          sfx.pickup();
          return true;
        }
        if (g.state === 'cooking' && pattyReady()) {
          g.state = 'empty';
          g.progress = 0;
          chef.carrying = 'cooked-patty';
          sfx.ding();
          return true;
        }
        if (g.state === 'cooking') {
          showFlash('NOT READY', '#ffd166');
          sfx.error();
          return false;
        }
        if (g.state === 'burnt') {
          g.state = 'empty';
          g.progress = 0;
          chef.carrying = 'burnt';
          showFlash('BURNT PATTY', '#ff5a4e');
          sfx.error();
          return true;
        }
        return false;
      }
      default:
        return false;
    }
  }

  // Put the held item on the plate. Returns the placed id or null.
  function placeOnPlate(chef) {
    if (!chef.carrying) return null;
    const held = chef.carrying;
    if (held === 'raw-patty') {
      showFlash('GRILL IT FIRST', '#ffd166');
      sfx.error();
      return null;
    }
    if (held === 'burnt') {
      showFlash('BURNT — TRASH IT', '#ff5a4e');
      sfx.error();
      return null;
    }
    if (held === 'cooked-patty') {
      kitchen.plate.push('patty');
    } else {
      kitchen.plate.push(held);
    }
    chef.carrying = null;
    sfx.place();
    return kitchen.plate[kitchen.plate.length - 1];
  }

  function clearPlate() {
    kitchen.plate = [];
  }

  function trashHeld(chef) {
    if (!chef.carrying) return false;
    chef.carrying = null;
    sfx.chop();
    return true;
  }

  function reset() {
    kitchen.grill = { state: 'empty', progress: 0 };
    kitchen.plate = [];
    kitchen.flash = null;
  }

  return {
    kitchen, grillProgress, pattyReady, stationAt, nearStation, pointInRect,
    plateHit, interactStation, placeOnPlate, clearPlate, trashHeld, reset,
    serveWindowHit: (p) => pointInRect(p, SERVE_WINDOW),
    trashHit: (p) => pointInRect(p, TRASH),
    stationById,
  };
}
