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

import Array2D from "./Array2D.js";
import { BLOCK_NONE } from "./Block.js";

export default class Grid {
  constructor(xSquareCount, ySquareCount) {
    this.array = new Array2D(xSquareCount, ySquareCount);
  }

  initialize(getBlockType) {
    for (let x = 0; x < this.array.xCount; x++) {
      for (let y = 0; y < this.array.yCount; y++) {
        const type = getBlockType(x, y);
        if (type) {
          this.array.setValue(x, y, {
            type,
            stepsDown: 0,
            stepsLeft: 0
          });
        } else {
          this.array.setValue(x, y, null);
        }
      }
    }
  }

  serialize() {
    return {
      xCount: this.array.xCount,
      yCount: this.array.yCount,
      blocks: this.array.values.map(v => (v ? v.type : BLOCK_NONE))
    };
  }

  static deserialize(state) {
    const grid = new Grid(state.xCount, state.yCount);
    const blocks = state.blocks;
    grid.initialize((x, y) => blocks[x * state.yCount + y]);
    return grid;
  }

  hasContiguousArea() {
    // More likely to have blocks at bottom left, so start from there.
    for (let x = 0; x < this.array.xCount; x++) {
      for (let y = this.array.yCount - 1; y >= 0; y--) {
        if (this.isContiguousArea(x, y)) {
          return true;
        }
      }
    }

    return false;
  }

  isContiguousArea(x, y) {
    const initial = this.array.getValue(x, y);
    if (!initial) {
      return false;
    }

    function sameType(block) {
      return !!block && block.type === initial.type;
    }

    const top = this.array.getValue(x, y - 1);
    const right = this.array.getValue(x + 1, y);
    const down = this.array.getValue(x, y + 1);
    const left = this.array.getValue(x - 1, y);

    return sameType(top) || sameType(right) || sameType(down) || sameType(left);
  }

  /*
   * Clears contiguous blocks of the same color.
   * Returns the count of the blocks cleared.
   */
  clearContiguousBlocks(x, y) {
    const clearUp = (x, y, type) => {
      y = y - 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return 0;
      }
      this.array.setValue(x, y, null);
      return (
        1 + clearLeft(x, y, type) + clearUp(x, y, type) + clearRight(x, y, type)
      );
    };

    const clearRight = (x, y, type) => {
      x = x + 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return 0;
      }
      this.array.setValue(x, y, null);
      return (
        1 + clearUp(x, y, type) + clearRight(x, y, type) + clearDown(x, y, type)
      );
    };

    const clearLeft = (x, y, type) => {
      x = x - 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return 0;
      }
      this.array.setValue(x, y, null);
      return (
        1 + clearDown(x, y, type) + clearLeft(x, y, type) + clearUp(x, y, type)
      );
    };

    const clearDown = (x, y, type) => {
      y = y + 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return 0;
      }
      this.array.setValue(x, y, null);
      return (
        1 +
        clearRight(x, y, type) +
        clearDown(x, y, type) +
        clearLeft(x, y, type)
      );
    };

    const initial = this.array.getValue(x, y);
    if (!initial) {
      return 0;
    }

    // Clear the initial block
    this.array.setValue(x, y, null);

    // Clear recursively in all directions
    const count =
      1 +
      clearUp(x, y, initial.type) +
      clearRight(x, y, initial.type) +
      clearDown(x, y, initial.type) +
      clearLeft(x, y, initial.type);

    return count;
  }

  shiftBlocksDown() {
    let topShiftDownCount = 0;

    for (let x = 0; x < this.array.xCount; x++) {
      let emptyBlocksBelowCount = 0;

      for (let y = this.array.yCount - 1; y >= 0; y--) {
        const block = this.array.getValue(x, y);
        if (block) {
          block.stepsDown = emptyBlocksBelowCount;

          this.array.setValue(x, y, null);
          this.array.setValue(x, y + block.stepsDown, block);

          topShiftDownCount = Math.max(
            topShiftDownCount,
            emptyBlocksBelowCount
          );
        } else {
          emptyBlocksBelowCount++;
        }
      }
    }

    return topShiftDownCount;
  }

  shiftBlocksLeft() {
    let emptyColumnCount = 0;
    let topShiftLeftCount = 0;

    for (let x = 0; x < this.array.xCount; x++) {
      let allEmpty = true;

      for (let y = this.array.yCount - 1; y >= 0; y--) {
        let block = this.array.getValue(x, y);
        if (block) {
          allEmpty = false;
          if (emptyColumnCount > 0) {
            block.stepsLeft = emptyColumnCount;
            this.array.setValue(x, y, null);
            this.array.setValue(x - block.stepsLeft, y, block);
          }
        }
      }

      if (allEmpty) {
        emptyColumnCount++;
      } else {
        topShiftLeftCount = emptyColumnCount;
      }
    }

    return topShiftLeftCount;
  }

  resetShiftValues() {
    for (let x = 0; x < this.array.xCount; x++) {
      for (let y = 0; y < this.array.yCount; y++) {
        let block = this.array.getValue(x, y);

        if (block) {
          if (block.stepsDown !== 0) {
            block.stepsDown = 0;
          }
          if (block.stepsLeft !== 0) {
            block.stepsLeft = 0;
          }
        }
      }
    }
  }
}
