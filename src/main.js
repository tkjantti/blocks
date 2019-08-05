import Grid from "./Grid.js";
import { squareWidth, squareHeight, canvas, drawGrid } from "./Graphics.js";
import { listenMouseClicks } from "./Controls.js";
import AnimationState from "./AnimationState.js";
import { BLOCK_NONE, BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const ANIM_SPEED = 100;

const xSquareCount = Math.floor(canvas.width / squareWidth);
const ySquareCount = Math.floor(canvas.height / squareHeight);

let deltaTimeMs = 0;
let lastTimeStampMs = 0;

const grid = new Grid(xSquareCount, ySquareCount, BLOCK_NONE);

let shiftDownTimeElapsed = 0;
let topShiftDownCount = 0;

let shiftLeftTimeElapsed = 0;
let topShiftLeftCount = 0;

let animState = new AnimationState();

function animateBlocks(deltaTimeMs) {
  if (topShiftDownCount > 0) {
    shiftDownTimeElapsed += deltaTimeMs;
    const shiftDownRatio = shiftDownTimeElapsed / ANIM_SPEED;

    if (shiftDownRatio >= topShiftDownCount) {
      shiftDownTimeElapsed = 0;
      topShiftDownCount = 0;
      grid.resetVerticalPositions();

      topShiftLeftCount = grid.shiftBlocksLeft();
    }

    animState.shiftDownRatio = shiftDownRatio;
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

  animateBlocks(deltaTimeMs);

  drawGrid(grid, animState);
}

function initializeGame() {
  const blockTypes = [BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN];
  grid.initialize(() => blockTypes[Math.floor(Math.random() * blockTypes.length)]);

  listenMouseClicks(canvas, function (mouseX, mouseY) {
    if (topShiftDownCount > 0 || topShiftLeftCount > 0) {
      return;
    }

    const x = Math.floor(mouseX / squareWidth);
    const y = Math.floor(mouseY / squareHeight);

    if (!grid.isContiguousArea(x, y)) {
      return;
    }

    grid.clearContiguousBlocks(x, y);

    topShiftDownCount = grid.shiftBlocksDown();
    if (topShiftDownCount === 0) {
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
