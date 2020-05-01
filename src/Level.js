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

import Grid from "./Grid.js";
import { canvas, drawGrid } from "./Graphics.js";
import AnimationState from "./AnimationState.js";
import { BLOCK_NONE, BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

const ANIM_DURATION = 100;

const xSquareCount = 16;
const ySquareCount = 12;

const blockTypes = [BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN];

function getRandomBlockType() {
  return blockTypes[Math.floor(Math.random() * blockTypes.length)];
}

export class Level {
  constructor() {
    this.grid = new Grid(xSquareCount, ySquareCount, BLOCK_NONE);
    this.animState = new AnimationState();

    this.yShiftTimeElapsed = 0;
    this.yShiftSquares = 0;

    this.xShiftTimeElapsed = 0;
    this.xShiftSquares = 0;
  }

  fill(oldLevel) {
    if (oldLevel) {
      const yShiftAnimForNewSquares = 6;
      this.grid.copyFrom(oldLevel.grid);
      this.grid.initializeEmptySquares(
        getRandomBlockType,
        yShiftAnimForNewSquares
      );
      this.yShiftSquares = yShiftAnimForNewSquares;
    } else {
      this.grid.initialize(getRandomBlockType);
    }
  }

  serialize() {
    return {
      grid: this.grid.serialize()
    };
  }

  static deserialize(state) {
    const level = new Level();
    level.grid = Grid.deserialize(state.grid);
    return level;
  }

  update(deltaTimeMs) {
    this.animateBlocks(deltaTimeMs);
  }

  draw(deltaTimeMs, endAnimation) {
    drawGrid(this.grid, deltaTimeMs, this.animState, endAnimation);
  }

  isFinished() {
    return !(this.isAnimating() || this.grid.hasContiguousArea());
  }

  onClick(screenX, screenY) {
    if (this.isAnimating()) {
      return 0;
    }

    const { xCount, yCount } = this.grid.array;
    const squareWidth = canvas.width / xCount;
    const squareHeight = canvas.height / yCount;

    const x = Math.floor(screenX / squareWidth);
    const y = Math.floor(screenY / squareHeight);

    if (!this.grid.isContiguousArea(x, y)) {
      return 0;
    }

    const count = this.grid.clearContiguousBlocks(x, y);
    const score = this.calculateScore(count);

    this.yShiftSquares = this.grid.shiftBlocksDown();
    this.xShiftSquares = this.grid.shiftBlocksLeft();

    this.animState.yShift = this.yShiftSquares;
    this.animState.xShift = this.xShiftSquares;

    return score;
  }

  calculateScore(count) {
    return count * count;
  }

  isAnimating() {
    return this.yShiftSquares > 0 || this.xShiftSquares > 0;
  }

  // t = easingFunction(t)
  // new_value = start_value +  (t * (end_value - start_value))
  easingFunction(t) {
    return --t * t * t + 1;
  }

  animateBlocks(deltaTimeMs) {
    if (this.yShiftSquares > 0) {
      this.yShiftTimeElapsed += deltaTimeMs;

      const t = this.easingFunction(this.yShiftTimeElapsed / ANIM_DURATION);
      const currentYShift = (t * this.yShiftSquares) / ANIM_DURATION;

      if (currentYShift <= this.yShiftSquares) {
        this.animState.yShift = this.yShiftSquares - currentYShift;
      } else {
        // Stop shift down animation,
        // ready to start horizontal shift.
        this.yShiftTimeElapsed = 0;
        this.yShiftSquares = 0;
        this.animState.yShift = 0;
      }
    } else if (this.xShiftSquares > 0) {
      this.xShiftTimeElapsed += deltaTimeMs;

      const t = this.easingFunction(this.xShiftTimeElapsed / ANIM_DURATION);
      const currentXShift = (t * this.xShiftSquares) / ANIM_DURATION;

      if (currentXShift <= this.xShiftSquares) {
        // if (0 < currentXShift) {
        this.animState.xShift = this.xShiftSquares - currentXShift;
      } else {
        // Shift left animation done
        this.xShiftTimeElapsed = 0;
        this.xShiftSquares = 0;
        this.animState.xShift = 0;

        // Both vertical and horizontal animation done.
        this.grid.resetShiftValues();
      }
    }
  }
}
