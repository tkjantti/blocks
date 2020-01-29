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

import { drawText, drawUi } from "./Graphics.js";
import { Level } from "./Level.js";

const GAME_STORAGE_IDENTIFIER = "blocks-state";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const LEVEL_FINISH_TIMESPAN_MS = 1.5 * 1000;
const START_COUNTDOWN_TIMESPAN_MS = 60 * 1000;

export class Game {
  constructor() {
    this.lastTimeStampMs = 0;

    this.countdownTime = START_COUNTDOWN_TIMESPAN_MS;
    this.score = 0;

    this.level = new Level();
    this.levelFinishTime = null;

    this.isOver = false;
  }

  static load() {
    const storedData = localStorage.getItem(GAME_STORAGE_IDENTIFIER);
    if (!storedData) {
      return null;
    }

    const state = JSON.parse(storedData);
    const game = new Game();
    game.score = state.score;
    game.countdownTime = state.countdownTime;
    game.level = Level.deserialize(state.level);
    return game;
  }

  save() {
    const state = {
      score: this.score,
      countdownTime: this.countdownTime,
      level: this.level.serialize()
    };
    localStorage.setItem(GAME_STORAGE_IDENTIFIER, JSON.stringify(state));
  }

  onClick(screenX, screenY) {
    if (this.isOver) {
      return;
    }

    this.score += this.level.onClick(screenX, screenY);
  }

  gameLoop(ms) {
    requestAnimationFrame(this.gameLoop.bind(this));

    const deltaTimeMs = Math.min(ms - this.lastTimeStampMs, MAX_FRAME);
    this.lastTimeStampMs = ms;

    const updatedCountdownTime = this.countdownTime - deltaTimeMs;
    if (updatedCountdownTime > 0) {
      this.countdownTime = updatedCountdownTime;
    } else {
      this.isOver = true;
    }

    this.level.update(deltaTimeMs);

    this.level.draw();
    drawUi(this.countdownTime, this.score);

    if (this.isOver) {
      drawText("Game over!");
    } else if (this.level.isFinished()) {
      const now = performance.now();

      if (!this.levelFinishTime) {
        this.levelFinishTime = now;
      } else if (now - this.levelFinishTime < LEVEL_FINISH_TIMESPAN_MS) {
        drawText("Level done!");
      } else {
        this.level = new Level();
        this.levelFinishTime = null;

        this.save();
      }
    }
  }

  start() {
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
