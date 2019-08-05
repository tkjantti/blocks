
/*
 * A two-dimensional array.
 */
export default class Array2D {
  constructor(xCount, yCount) {
    this.xCount = xCount;
    this.yCount = yCount;
    this.values = [xCount * yCount];
  }

  getValue(x, y) {
    if (x < 0 || this.xCount <= x || y < 0 || this.yCount <= y) {
      return undefined;
    }
    return this.values[x * this.yCount + y];
  }

  setValue(x, y, value) {
    if (x < 0 || this.xCount <= x || y < 0 || this.yCount <= y) {
      return;
    }
    this.values[x * this.yCount + y] = value;
  }
}
