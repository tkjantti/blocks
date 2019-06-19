import { BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

export const canvas = document.querySelector("#board canvas");

const ctx = canvas.getContext("2d");

export const squareWidth = 64;
export const squareHeight = 64;


function getColor(block, x, y) {
  if (!block) {
    return `hsl(200, ${40 + ((x + y) % 2) * 30}%, 20%)`;
  }

  switch (block.type) {
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

export function drawGrid(grid, dropRatio) {
  const array2D = grid.array;

  for (let x = 0; x < array2D.xCount; x++) {
    for (let y = 0; y < array2D.yCount; y++) {
      const block = array2D.getValue(x, y);
      let yShift = 0;
      if (block && block.dropCount) {
        yShift = dropRatio * squareHeight;
      }
      ctx.fillStyle = getColor(block, x, y);
      ctx.fillRect(x * squareWidth, y * squareHeight + yShift, squareWidth, squareHeight);
    }
  }
}
