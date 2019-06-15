import Array2D from "./Array2D.js";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

const canvas = document.querySelector("#board canvas");
const ctx = canvas.getContext("2d");

const squareWidth = 64;
const squareHeight = 64;

const xSquareCount = Math.floor(canvas.width / squareWidth);
const ySquareCount = Math.floor(canvas.height / squareHeight);

let deltaTimeMs = 0;
let lastTimeStampMs = 0;

const BLOCK_NONE = 0;
const BLOCK_RED = 1;
const BLOCK_YELLOW = 2;
const BLOCK_GREEN = 3;

const array = new Array2D(xSquareCount, ySquareCount, BLOCK_NONE);

function getColor(block, x, y) {
  switch (block) {
  case BLOCK_RED:
    return 'red';
  case BLOCK_YELLOW:
    return 'yellow';
  case BLOCK_GREEN:
    return 'green';
  default:
    return `hsl(200, ${40 + ((x + y) % 2) * 30}%, 20%)`;
  }
}

function drawGrid() {
  for (let x = 0; x < xSquareCount; x++) {
    for (let y = 0; y < ySquareCount; y++) {
      const block = array.getValue(x, y);
      ctx.fillStyle = getColor(block, x, y);
      ctx.fillRect(x * squareWidth, y * squareHeight, squareWidth, squareHeight);
    }
  }
}

function ccb_up(x, y, color) {
  y = y - 1;
  const current = array.getValue(x, y);
  if (current !== color) {
    return;
  }

  array.setValue(x, y, BLOCK_NONE);
  ccb_left(x, y, color);
  ccb_up(x, y, color);
  ccb_right(x, y, color);
}

function ccb_right(x, y, color) {
  x = x + 1;
  const current = array.getValue(x, y);
  if (current !== color) {
    return;
  }

  array.setValue(x, y, BLOCK_NONE);
  ccb_up(x, y, color);
  ccb_right(x, y, color);
  ccb_down(x, y, color);
}

function ccb_left(x, y, color) {
  x = x - 1;
  const current = array.getValue(x, y);
  if (current !== color) {
    return;
  }

  array.setValue(x, y, BLOCK_NONE);
  ccb_down(x, y, color);
  ccb_left(x, y, color);
  ccb_up(x, y, color);
}

function ccb_down(x, y, color) {
  y = y + 1;
  const current = array.getValue(x, y);
  if (current !== color) {
    return;
  }

  array.setValue(x, y, BLOCK_NONE);
  ccb_right(x, y, color);
  ccb_down(x, y, color);
  ccb_left(x, y, color);
}

function clearContiguousBlocks(x, y) {
  const color = array.getValue(x, y);
  if (color === BLOCK_NONE) {
    return;
  }

  array.setValue(x, y, BLOCK_NONE);
  ccb_up(x, y, color);
  ccb_right(x, y, color);
  ccb_down(x, y, color);
  ccb_left(x, y, color);
}

function shiftColumnDown(x, yStart) {
  for (let y = yStart; y >= 0; y--) {
    const above = array.getValue(x, y);
    array.setValue(x, y + 1, above);
  }
  array.setValue(x, 0, BLOCK_NONE);
}

function shiftBlocksDown() {
  for (let x = 0; x < xSquareCount; x++) {
    for (let y = ySquareCount - 1; y > 0; y--) {
      let count = 0;

      while (array.getValue(x, y) === BLOCK_NONE && count < ySquareCount) {
        shiftColumnDown(x, y - 1);
        count++;
      }
    }
  }
}

function isColumnEmpty(x) {
  for (let y = ySquareCount - 1; y >= 0; y--) {
    if (array.getValue(x, y) !== BLOCK_NONE) {
      return false;
    }
  }

  return true;
}

function shiftColumnsLeft(xStart) {
  for (let x = xStart; x < xSquareCount; x++) {
    for (let y = ySquareCount - 1; y >= 0; y--) {
      const block = array.getValue(x, y);
      array.setValue(x - 1, y, block);
    }
  }

  for (let y = ySquareCount - 1; y >= 0; y--) {
    array.setValue(xSquareCount - 1, y, BLOCK_NONE);
  }
}

function shiftBlocksLeft() {
  for (let x = 0; x < xSquareCount - 1; x++) {
    let count = 0;
    while (isColumnEmpty(x) && count < xSquareCount) {
      shiftColumnsLeft(x + 1);
      count++;
    }
  }
}

function listenMouseClicks(element, handler) {
  function mouseUp(e) {
    const rect = element.getBoundingClientRect();
    const xr = element.width / element.clientWidth;
    const yr = element.height / element.clientHeight;
    let x = (e.clientX - rect.left) * xr;
    let y = (e.clientY - rect.top) * yr;

    if (0 <= x && x < (element.width * xr) && 0 <= y && y < (element.height * xr)) {
      handler(x, y);
    }
  }

  document.addEventListener('mouseup', mouseUp, false);
}

function mainLoop(ms) {
  requestAnimationFrame(mainLoop);

  deltaTimeMs = Math.min(ms - lastTimeStampMs, MAX_FRAME);
  lastTimeStampMs = ms;

  drawGrid();
}

function initializeGame() {
  const blockTypes = [BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN];

  for (let x = 0; x < xSquareCount; x++) {
    for (let y = 0; y < ySquareCount; y++) {
      array.setValue(x, y, blockTypes[Math.floor(Math.random() * blockTypes.length)]);
    }
  }

  requestAnimationFrame(mainLoop);

  listenMouseClicks(canvas, function (mouseX, mouseY) {
    const x = Math.floor(mouseX / squareWidth);
    const y = Math.floor(mouseY / squareHeight);

    clearContiguousBlocks(x, y);
    shiftBlocksDown();
    shiftBlocksLeft();
  });
}

initializeGame();
