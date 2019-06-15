import Grid from "./Grid.js";

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

const grid = new Grid(xSquareCount, ySquareCount, BLOCK_NONE);

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
  const gridArray = grid.array;
  for (let x = 0; x < xSquareCount; x++) {
    for (let y = 0; y < ySquareCount; y++) {
      const block = gridArray.getValue(x, y);
      ctx.fillStyle = getColor(block, x, y);
      ctx.fillRect(x * squareWidth, y * squareHeight, squareWidth, squareHeight);
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
  grid.initialize(() => blockTypes[Math.floor(Math.random() * blockTypes.length)]);

  requestAnimationFrame(mainLoop);

  listenMouseClicks(canvas, function (mouseX, mouseY) {
    const x = Math.floor(mouseX / squareWidth);
    const y = Math.floor(mouseY / squareHeight);

    grid.clearContiguousBlocks(x, y);
    grid.shiftBlocksDown();
    grid.shiftBlocksLeft();
  });
}

initializeGame();
