// Sizzle & Serve — keyboard and mouse input.
// One job: turn raw events into a clean per-frame intent the game loop reads.

export function createInput(canvas) {
  const keys = new Set();
  const state = {
    moveX: 0,
    moveY: 0,
    interactPressed: false,
    placePressed: false,
    pausePressed: false,
    mutePressed: false,
    startPressed: false,
    restartPressed: false,
    click: null, // {x, y} in canvas coordinates, consumed by the loop
    mouse: { x: 0, y: 0 },
  };

  const KEY_ACTIONS = {
    KeyE: 'interactPressed',
    Space: 'placePressed',
    KeyP: 'pausePressed',
    KeyM: 'mutePressed',
    Enter: 'startPressed',
    KeyR: 'restartPressed',
  };

  function canvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    keys.add(e.code);
    const action = KEY_ACTIONS[e.code];
    if (action) {
      state[action] = true;
      e.preventDefault();
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (e) => {
    state.click = canvasPoint(e.clientX, e.clientY);
    state.mouse = state.click;
  });
  canvas.addEventListener('pointermove', (e) => {
    state.mouse = canvasPoint(e.clientX, e.clientY);
  });

  // Recompute the held movement vector each frame from the live key set.
  function pollMovement() {
    let x = 0;
    let y = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    state.moveX = x;
    state.moveY = y;
  }

  // One-shot actions clear after the loop reads them.
  function endFrame() {
    state.interactPressed = false;
    state.placePressed = false;
    state.pausePressed = false;
    state.mutePressed = false;
    state.startPressed = false;
    state.restartPressed = false;
    state.click = null;
  }

  return { state, pollMovement, endFrame };
}
