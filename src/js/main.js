
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

class Grid {
  constructor(xCount, yCount) {
    this.xCount = xCount;
    this.yCount = yCount;
    this.blocks = [xCount * yCount];
  }

  getBlock(x, y) {
    if (x < 0 || this.xCount <= x || y < 0 || this.yCount <= y) {
      return BLOCK_NONE;
    }
    return this.blocks[x * ySquareCount + y];
  }

  setBlock(x, y, type) {
    if (x < 0 || this.xCount <= x || y < 0 || this.yCount <= y) {
      return;
    }
    this.blocks[x * ySquareCount + y] = type;
  }
}

const grid = new Grid(xSquareCount, ySquareCount);

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
      const block = grid.getBlock(x, y);
      ctx.fillStyle = getColor(block, x, y);
      ctx.fillRect(x * squareWidth, y * squareHeight, squareWidth, squareHeight);
    }
  }
}

function ccb_up(x, y, color) {
  y = y - 1;
  const current = grid.getBlock(x, y);
  if (current !== color) {
    return;
  }

  grid.setBlock(x, y, BLOCK_NONE);
  ccb_left(x, y, color);
  ccb_up(x, y, color);
  ccb_right(x, y, color);
}

function ccb_right(x, y, color) {
  x = x + 1;
  const current = grid.getBlock(x, y);
  if (current !== color) {
    return;
  }

  grid.setBlock(x, y, BLOCK_NONE);
  ccb_up(x, y, color);
  ccb_right(x, y, color);
  ccb_down(x, y, color);
}

function ccb_left(x, y, color) {
  x = x - 1;
  const current = grid.getBlock(x, y);
  if (current !== color) {
    return;
  }

  grid.setBlock(x, y, BLOCK_NONE);
  ccb_down(x, y, color);
  ccb_left(x, y, color);
  ccb_up(x, y, color);
}

function ccb_down(x, y, color) {
  y = y + 1;
  const current = grid.getBlock(x, y);
  if (current !== color) {
    return;
  }

  grid.setBlock(x, y, BLOCK_NONE);
  ccb_right(x, y, color);
  ccb_down(x, y, color);
  ccb_left(x, y, color);
}

function clearContiguousBlocks(x, y) {
  const color = grid.getBlock(x, y);
  if (color === BLOCK_NONE) {
    return;
  }

  grid.setBlock(x, y, BLOCK_NONE);
  ccb_up(x, y, color);
  ccb_right(x, y, color);
  ccb_down(x, y, color);
  ccb_left(x, y, color);
}

function shiftColumnDown(x, yStart) {
  for (let y = yStart; y >= 0; y--) {
    const above = grid.getBlock(x, y);
    grid.setBlock(x, y + 1, above);
  }
  grid.setBlock(x, 0, BLOCK_NONE);
}

function shiftBlocksDown() {
  for (let x = 0; x < xSquareCount; x++) {
    for (let y = ySquareCount - 1; y > 0; y--) {
      let count = 0;

      while (grid.getBlock(x, y) === BLOCK_NONE && count < ySquareCount) {
        shiftColumnDown(x, y - 1);
        count++;
      }
    }
  }
}

function isColumnEmpty(x) {
  for (let y = ySquareCount - 1; y >= 0; y--) {
    if (grid.getBlock(x, y) !== BLOCK_NONE) {
      return false;
    }
  }

  return true;
}

function shiftColumnsLeft(xStart) {
  for (let x = xStart; x < xSquareCount; x++) {
    for (let y = ySquareCount - 1; y >= 0; y--) {
      const block = grid.getBlock(x, y);
      grid.setBlock(x - 1, y, block);
    }
  }

  for (let y = ySquareCount - 1; y >= 0; y--) {
    grid.setBlock(xSquareCount - 1, y, BLOCK_NONE);
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
      grid.setBlock(x, y, blockTypes[Math.floor(Math.random() * blockTypes.length)]);
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
