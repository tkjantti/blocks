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

let dropTimeElapsed = 0;
let topDropCount = 0;

function animateBlocks(deltaTimeMs) {
  dropTimeElapsed += deltaTimeMs;
  const dropRatio = dropTimeElapsed / 1000;
  if (dropRatio >= topDropCount) {
    dropTimeElapsed = 0;
    topDropCount = 0;
    grid.resetBlockPositions();
  }
  return dropRatio;
}

function gameLoop(ms) {
  requestAnimationFrame(gameLoop);

  deltaTimeMs = Math.min(ms - lastTimeStampMs, MAX_FRAME);
  lastTimeStampMs = ms;

  const dropRatio = animateBlocks(deltaTimeMs);

  drawGrid(grid, dropRatio);
}

function initializeGame() {
  const blockTypes = [BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN];
  grid.initialize(() => blockTypes[Math.floor(Math.random() * blockTypes.length)]);

  listenMouseClicks(canvas, function (mouseX, mouseY) {
    if (topDropCount > 0) {
      return;
    }

    const x = Math.floor(mouseX / squareWidth);
    const y = Math.floor(mouseY / squareHeight);

    grid.clearContiguousBlocks(x, y);
    topDropCount = grid.shiftBlocksDown();
//    grid.shiftBlocksLeft();
  });
}

function main() {
  initializeGame();
  requestAnimationFrame(gameLoop);
}

main();
