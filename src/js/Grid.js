import Array2D from "./Array2D.js";

export default class Grid {
  constructor(xSquareCount, ySquareCount, defaultValue) {
    this.array = new Array2D(xSquareCount, ySquareCount, defaultValue);
    this.defaultValue = defaultValue;
  }

  initialize(getInitialValue) {
    for (let x = 0; x < this.array.xCount; x++) {
      for (let y = 0; y < this.array.yCount; y++) {
        this.array.setValue(x, y, getInitialValue());
      }
    }
  }

  /*
   * Clears contiguous blocks of the same color.
   */
  clearContiguousBlocks(x, y) {
    const clearUp = (x, y, value) => {
      y = y - 1;
      const current = this.array.getValue(x, y);
      if (current !== value) {
        return;
      }

      this.array.setValue(x, y, this.defaultValue);
      clearLeft(x, y, value);
      clearUp(x, y, value);
      clearRight(x, y, value);
    };

    const clearRight = (x, y, value) => {
      x = x + 1;
      const current = this.array.getValue(x, y);
      if (current !== value) {
        return;
      }

      this.array.setValue(x, y, this.defaultValue);
      clearUp(x, y, value);
      clearRight(x, y, value);
      clearDown(x, y, value);
    };

    const clearLeft = (x, y, value) => {
      x = x - 1;
      const current = this.array.getValue(x, y);
      if (current !== value) {
        return;
      }

      this.array.setValue(x, y, this.defaultValue);
      clearDown(x, y, value);
      clearLeft(x, y, value);
      clearUp(x, y, value);
    };

    const clearDown = (x, y, value) => {
      y = y + 1;
      const current = this.array.getValue(x, y);
      if (current !== value) {
        return;
      }

      this.array.setValue(x, y, this.defaultValue);
      clearRight(x, y, value);
      clearDown(x, y, value);
      clearLeft(x, y, value);
    };


    const value = this.array.getValue(x, y);
    if (value === this.defaultValue) {
      return;
    }

    // Clear the initial value
    this.array.setValue(x, y, this.defaultValue);

    // Clear recursively in all directions
    clearUp(x, y, value);
    clearRight(x, y, value);
    clearDown(x, y, value);
    clearLeft(x, y, value);
  }

  shiftBlocksDown() {
    const shiftColumnDown = (x, yStart) => {
      for (let y = yStart; y >= 0; y--) {
        const above = this.array.getValue(x, y);
        this.array.setValue(x, y + 1, above);
      }
      this.array.setValue(x, 0, this.defaultValue);
    };

    for (let x = 0; x < this.array.xCount; x++) {
      for (let y = this.array.yCount - 1; y > 0; y--) {
        let count = 0;

        while (this.array.getValue(x, y) === this.defaultValue && count < this.array.yCount) {
          shiftColumnDown(x, y - 1);
          count++;
        }
      }
    }
  }

  shiftBlocksLeft() {
    const isColumnEmpty = (x) => {
      for (let y = this.array.yCount - 1; y >= 0; y--) {
        if (this.array.getValue(x, y) !== this.defaultValue) {
          return false;
        }
      }

      return true;
    };

    const shiftColumnsLeft = (xStart) => {
      for (let x = xStart; x < this.array.xCount; x++) {
        for (let y = this.array.yCount - 1; y >= 0; y--) {
          const block = this.array.getValue(x, y);
          this.array.setValue(x - 1, y, block);
        }
      }

      for (let y = this.array.yCount - 1; y >= 0; y--) {
        this.array.setValue(this.array.xCount - 1, y, this.defaultValue);
      }
    };

    for (let x = 0; x < this.array.xCount - 1; x++) {
      let count = 0;
      while (isColumnEmpty(x) && count < this.array.xCount) {
        shiftColumnsLeft(x + 1);
        count++;
      }
    }
  }
}
