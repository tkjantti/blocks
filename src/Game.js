/*
 * Copyright (c) 2019, 2020 Tero Jäntti, Sami Heikkinen
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

import { drawHighScoreList, drawText, drawUi } from "./Graphics.js";
import { Level } from "./Level.js";
import { HighScoreList } from "./HighScoreList.js";

const STORAGE_ID_GAME_STATE = "blocks-state";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const LEVEL_FINISH_TIMESPAN_MS = 1.5 * 1000;
const COUNTDOWN_TIMESPAN_MS = 60 * 1000;
const GAME_OVER_TIMESPAN_MS = 3 * 1000;

const SCORE_TARGET_BASE = 500;

export class Game {
  constructor() {
    this.lastTimeStampMs = 0;

    this.countdownTime = COUNTDOWN_TIMESPAN_MS;
    this.score = 0;
    this.targetScore = SCORE_TARGET_BASE;
    this.targetScoreSetCount = 1;
    this.highScoreList = [];

    this.level = new Level();
    this.level.fill();
    this.levelFinishTime = null;

    this.gameOverTime = null;
    this.readyForNewGame = false;
  }

  static load() {
    const storedData = localStorage.getItem(STORAGE_ID_GAME_STATE);
    if (!storedData) {
      return null;
    }

    const state = JSON.parse(storedData);
    const game = new Game();
    game.score = state.score;
    game.targetScore = state.targetScore;
    game.countdownTime = state.countdownTime;
    game.level = Level.deserialize(state.level);
    return game;
  }

  save() {
    const state = {
      score: this.score,
      targetScore: this.targetScore,
      countdownTime: this.countdownTime,
      level: this.level.serialize()
    };
    localStorage.setItem(STORAGE_ID_GAME_STATE, JSON.stringify(state));
  }

  clearSavedData() {
    localStorage.removeItem(STORAGE_ID_GAME_STATE);
  }

  isOver() {
    return this.gameOverTime != null;
  }

  // Returns true when a new game is requested.
  onClick(screenX, screenY) {
    if (this.isOver()) {
      return this.readyForNewGame;
    }

    this.score += this.level.onClick(screenX, screenY);
    return false;
  }

  gameLoop(ms) {
    requestAnimationFrame(this.gameLoop.bind(this));

    const deltaTimeMs = Math.min(ms - this.lastTimeStampMs, MAX_FRAME);
    this.lastTimeStampMs = ms;
    const now = performance.now();

    if (this.gameOverTime == null && !this.updateCountdown(deltaTimeMs)) {
      this.gameOverTime = now;

      this.highScoreList = HighScoreList.load();
      this.highScoreList.add({ name: "You", score: this.score });
      this.highScoreList.save();
    }

    this.level.update(deltaTimeMs);

    this.level.draw(this.gameOverTime != null);
    drawUi(this.countdownTime, this.score, this.targetScore - this.score);

    if (this.gameOverTime != null) {
      drawHighScoreList(this.highScoreList);

      if (now - this.gameOverTime >= GAME_OVER_TIMESPAN_MS) {
        this.readyForNewGame = true;
      }
    } else if (this.level.isFinished()) {
      if (!this.levelFinishTime) {
        this.levelFinishTime = now;
      } else if (now - this.levelFinishTime < LEVEL_FINISH_TIMESPAN_MS) {
        drawText("Level done!");
      } else {
        const oldLevel = this.level;

        this.level = new Level();
        this.level.fill(oldLevel);
        this.levelFinishTime = null;

        this.save();
      }
    }
  }

  updateCountdown(deltaTimeMs) {
    let updatedCountdownTime = this.countdownTime - deltaTimeMs;

    if (updatedCountdownTime > 0) {
      if (this.score >= this.targetScore) {
        this.targetScoreSetCount += 1;
        this.targetScore =
          this.score + this.targetScoreSetCount * SCORE_TARGET_BASE;
        updatedCountdownTime = COUNTDOWN_TIMESPAN_MS;
      }

      this.countdownTime = updatedCountdownTime;
    } else {
      return false;
    }

    return true;
  }

  start() {
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
