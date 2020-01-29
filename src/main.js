/*
 * Copyright (c) 2019 Tero Jäntti
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { canvas } from "./Graphics.js";
import { listenMouseClicks } from "./Controls.js";
import { drawText, drawUi } from "./Graphics.js";
import { Level } from "./Level.js";

const GAME_STORAGE_IDENTIFIER = "blocks-state";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const LEVEL_FINISH_TIMESPAN_MS = 1.5 * 1000;
const START_COUNTDOWN_TIMESPAN_MS = 60 * 1000;

let lastTimeStampMs = 0;

let countdownTime = START_COUNTDOWN_TIMESPAN_MS;

let score = 0;

let level = new Level();
let levelFinishTime = null;

let gameOver = false;

function loadGame() {
  const storedData = localStorage.getItem(GAME_STORAGE_IDENTIFIER);

  if (storedData) {
    const state = JSON.parse(storedData);
    score = state.score;
    level = Level.deserialize(state.level);
  }
}

function saveGame() {
  const state = {
    score,
    level: level.serialize()
  };
  localStorage.setItem(GAME_STORAGE_IDENTIFIER, JSON.stringify(state));
}

function gameLoop(ms) {
  requestAnimationFrame(gameLoop);

  const deltaTimeMs = Math.min(ms - lastTimeStampMs, MAX_FRAME);
  lastTimeStampMs = ms;

  const updatedCountdownTime = countdownTime - deltaTimeMs;
  if (updatedCountdownTime > 0) {
    countdownTime = updatedCountdownTime;
  } else {
    gameOver = true;
  }

  level.update(deltaTimeMs);

  level.draw();
  drawUi(countdownTime, score);

  if (gameOver) {
    drawText("Game over!");
  } else if (level.isFinished()) {
    const now = performance.now();

    if (!levelFinishTime) {
      levelFinishTime = now;
    } else if (now - levelFinishTime < LEVEL_FINISH_TIMESPAN_MS) {
      drawText("Level done!");
    } else {
      level = new Level();
      levelFinishTime = null;

      saveGame();
    }
  }
}

function initializeGame() {
  score = 0;
  listenMouseClicks(canvas, (screenX, screenY) => {
    if (gameOver) {
      return;
    }
    score += level.onClick(screenX, screenY);
  });

  window.addEventListener("unload", () => {
    saveGame();
  });

  loadGame();
}

initializeGame();
requestAnimationFrame(gameLoop);
