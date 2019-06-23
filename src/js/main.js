import Grid from "./Grid.js";
import { squareWidth, squareHeight, canvas, drawGrid } from "./Graphics.js";
import { listenMouseClicks } from "./Controls.js";
import { BLOCK_NONE, BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const ANIM_SPEED = 100;

const xSquareCount = Math.floor(canvas.width / squareWidth);
const ySquareCount = Math.floor(canvas.height / squareHeight);

let deltaTimeMs = 0;
let lastTimeStampMs = 0;

const grid = new Grid(xSquareCount, ySquareCount, BLOCK_NONE);

let dropTimeElapsed = 0;
let topDropCount = 0;

let shiftLeftTimeElapsed = 0;
let topShiftLeftCount = 0;

function animateBlocks(deltaTimeMs) {
  let animState = {
    shiftDownRatio: 0,
    shiftLeftRatio: 0,
  };

  if (topDropCount > 0) {
    dropTimeElapsed += deltaTimeMs;
    const dropRatio = dropTimeElapsed / ANIM_SPEED;

    if (dropRatio >= topDropCount) {
      dropTimeElapsed = 0;
      topDropCount = 0;
      grid.resetVerticalPositions();

      topShiftLeftCount = grid.shiftBlocksLeft();
    }

    animState.shiftDownRatio = dropRatio;
  } else if (topShiftLeftCount > 0) {
    shiftLeftTimeElapsed += deltaTimeMs;
    const shiftLeftRatio = shiftLeftTimeElapsed / ANIM_SPEED;

    if (shiftLeftRatio >= topShiftLeftCount) {
      shiftLeftTimeElapsed = 0;
      topShiftLeftCount = 0;
      grid.resetHorizontalPositions();
    }

    animState.shiftLeftRatio = shiftLeftRatio;
  }

  return animState;
}

function gameLoop(ms) {
  requestAnimationFrame(gameLoop);

  deltaTimeMs = Math.min(ms - lastTimeStampMs, MAX_FRAME);
  lastTimeStampMs = ms;

  const animState = animateBlocks(deltaTimeMs);

  drawGrid(grid, animState);
}

function initializeGame() {
  const blockTypes = [BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN];
  grid.initialize(() => blockTypes[Math.floor(Math.random() * blockTypes.length)]);

  listenMouseClicks(canvas, function (mouseX, mouseY) {
    if (topDropCount > 0 || topShiftLeftCount > 0) {
      return;
    }

    const x = Math.floor(mouseX / squareWidth);
    const y = Math.floor(mouseY / squareHeight);

    grid.clearContiguousBlocks(x, y);
    topDropCount = grid.shiftBlocksDown();
    if (topDropCount === 0) {
      // No need to animate dropping down, start shift left animation immediately.
      topShiftLeftCount = grid.shiftBlocksLeft();
    }
  });
}

function main() {
  initializeGame();
  requestAnimationFrame(gameLoop);
}

main();
