import Array2D from "./Array2D.js";

export default class Grid {
  constructor(xSquareCount, ySquareCount) {
    this.array = new Array2D(xSquareCount, ySquareCount);
  }

  initialize(getInitialBlockType) {
    for (let x = 0; x < this.array.xCount; x++) {
      for (let y = 0; y < this.array.yCount; y++) {
        this.array.setValue(x, y, {
          type: getInitialBlockType(),
          dropCount: 0,
          stepsLeft: 0,
        });
      }
    }
  }

  /*
   * Clears contiguous blocks of the same color.
   */
  clearContiguousBlocks(x, y) {
    const clearUp = (x, y, type) => {
      y = y - 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return;
      }

      this.array.setValue(x, y, null);
      clearLeft(x, y, type);
      clearUp(x, y, type);
      clearRight(x, y, type);
    };

    const clearRight = (x, y, type) => {
      x = x + 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return;
      }

      this.array.setValue(x, y, null);
      clearUp(x, y, type);
      clearRight(x, y, type);
      clearDown(x, y, type);
    };

    const clearLeft = (x, y, type) => {
      x = x - 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return;
      }

      this.array.setValue(x, y, null);
      clearDown(x, y, type);
      clearLeft(x, y, type);
      clearUp(x, y, type);
    };

    const clearDown = (x, y, type) => {
      y = y + 1;
      const current = this.array.getValue(x, y);
      if (!current || current.type !== type) {
        return;
      }

      this.array.setValue(x, y, null);
      clearRight(x, y, type);
      clearDown(x, y, type);
      clearLeft(x, y, type);
    };


    const initial = this.array.getValue(x, y);
    if (!initial) {
      return;
    }

    // Clear the initial block
    this.array.setValue(x, y, null);

    // Clear recursively in all directions
    clearUp(x, y, initial.type);
    clearRight(x, y, initial.type);
    clearDown(x, y, initial.type);
    clearLeft(x, y, initial.type);
  }

  shiftBlocksDown() {
    let topDropCount = 0;

    for (let x = 0; x < this.array.xCount; x++) {
      let emptyBlocksBelowCount = 0;
      for (let y = this.array.yCount - 1; y >= 0; y--) {
        const block = this.array.getValue(x, y);
        if (block) {
          block.dropCount = emptyBlocksBelowCount;
          topDropCount = Math.max(topDropCount, emptyBlocksBelowCount);
        } else {
          emptyBlocksBelowCount++;
        }
      }
    }

    return topDropCount;
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

  resetVerticalPositions() {
    for (let x = 0; x < this.array.xCount; x++) {
      for (let y = this.array.yCount - 1; y >= 0; y--) {
        let block = this.array.getValue(x, y);

        if (block && block.dropCount) {
          if (y + block.dropCount >= this.array.yCount) {
            // Shouldn't happen
            console.warn('DROPCOUNT OVERFLOW!'); // jshint ignore:line
            continue;
          }

          this.array.setValue(x, y, null);
          this.array.setValue(x, y + block.dropCount, block);
          block.dropCount = 0;
        }
      }
    }
  }
}
