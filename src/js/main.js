import Grid from "./Grid.js";
import { squareWidth, squareHeight, canvas, drawGrid } from "./Graphics.js";
import { listenMouseClicks } from "./Controls.js";
import { BLOCK_NONE, BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const xSquareCount = Math.floor(canvas.width / squareWidth);
const ySquareCount = Math.floor(canvas.height / squareHeight);

let deltaTimeMs = 0;
let lastTimeStampMs = 0;

const grid = new Grid(xSquareCount, ySquareCount, BLOCK_NONE);

function gameLoop(ms) {
  requestAnimationFrame(gameLoop);

  deltaTimeMs = Math.min(ms - lastTimeStampMs, MAX_FRAME);
  lastTimeStampMs = ms;

  drawGrid(grid);
}

function initializeGame() {
  const blockTypes = [BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN];
  grid.initialize(() => blockTypes[Math.floor(Math.random() * blockTypes.length)]);

  listenMouseClicks(canvas, function (mouseX, mouseY) {
    const x = Math.floor(mouseX / squareWidth);
    const y = Math.floor(mouseY / squareHeight);

    grid.clearContiguousBlocks(x, y);
    grid.shiftBlocksDown();
    grid.shiftBlocksLeft();
  });
}

function main() {
  initializeGame();
  requestAnimationFrame(gameLoop);
}

main();