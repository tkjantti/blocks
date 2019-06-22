import { BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

export const canvas = document.querySelector("#board canvas");

const ctx = canvas.getContext("2d");

export const squareWidth = 64;
export const squareHeight = 64;

function getColor(blockType) {
  switch (blockType) {
  case BLOCK_RED:
    return 'red';
  case BLOCK_YELLOW:
    return 'yellow';
  case BLOCK_GREEN:
    return 'green';
  default:
    return 'black';
  }
}

function drawBackground(array2D) {
  for (let x = 0; x < array2D.xCount; x++) {
    for (let y = 0; y < array2D.yCount; y++) {
      ctx.fillStyle = `hsl(200, ${40 + ((x + y) % 2) * 30}%, 20%)`;
      ctx.fillRect(x * squareWidth, y * squareHeight, squareWidth, squareHeight);
    }
  }
}

export function drawGrid(grid, animState) {
  const array2D = grid.array;

  drawBackground(array2D);

  for (let x = 0; x < array2D.xCount; x++) {
    for (let y = 0; y < array2D.yCount; y++) {
      const block = array2D.getValue(x, y);

      if (block) {
        const yShift = Math.min(animState.shiftDownRatio, block.dropCount) * squareHeight;
        const xShift = Math.min(animState.shiftLeftRatio, block.stepsLeft) * squareWidth;

        ctx.fillStyle = getColor(block.type);
        ctx.fillRect(
          x * squareWidth - xShift,
          y * squareHeight + yShift,
          squareWidth,
          squareHeight);
      }
    }
  }
}
