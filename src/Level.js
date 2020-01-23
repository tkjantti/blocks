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

import Grid from "./Grid.js";
import { squareWidth, squareHeight, canvas, drawGrid } from "./Graphics.js";
import AnimationState from "./AnimationState.js";
import { BLOCK_NONE, BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

const ANIM_SPEED = 100;

const xSquareCount = Math.floor(canvas.width / squareWidth);
const ySquareCount = Math.floor(canvas.height / squareHeight);

export class Level {
  constructor() {
    this.grid = new Grid(xSquareCount, ySquareCount, BLOCK_NONE);
    this.animState = new AnimationState();

    this.yShiftTimeElapsed = 0;
    this.yShiftSquares = 0;

    this.xShiftTimeElapsed = 0;
    this.xShiftSquares = 0;

    const blockTypes = [BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN];
    this.grid.initialize(
      () => blockTypes[Math.floor(Math.random() * blockTypes.length)]
    );
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

  draw() {
    drawGrid(this.grid, this.animState);
  }

  isFinished() {
    return !(this.isAnimating() || this.grid.hasContiguousArea());
  }

  onClick(screenX, screenY) {
    if (this.isAnimating()) {
      return 0;
    }

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

  animateBlocks(deltaTimeMs) {
    if (this.yShiftSquares > 0) {
      this.yShiftTimeElapsed += deltaTimeMs;

      const currentYShift =
        this.yShiftSquares - this.yShiftTimeElapsed / ANIM_SPEED;

      if (0 < currentYShift) {
        this.animState.yShift = currentYShift;
      } else {
        // Stop shift down animation,
        // ready to start horizontal shift.
        this.yShiftTimeElapsed = 0;
        this.yShiftSquares = 0;
      }
    } else if (this.xShiftSquares > 0) {
      this.xShiftTimeElapsed += deltaTimeMs;

      const currentXShift =
        this.xShiftSquares - this.xShiftTimeElapsed / ANIM_SPEED;

      if (0 < currentXShift) {
        this.animState.xShift = currentXShift;
      } else {
        // Shift left animation done
        this.xShiftTimeElapsed = 0;
        this.xShiftSquares = 0;

        // Both vertical and horizontal animation done.
        this.grid.resetShiftValues();
      }
    }
  }
}
