
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

const BLOCK_RED = 1;
const BLOCK_YELLOW = 2;
const BLOCK_GREEN = 3;

const blocks = [xSquareCount * ySquareCount];


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
      const block = blocks[x * ySquareCount + y];
      ctx.fillStyle = getColor(block, x, y);
      ctx.fillRect(x * squareWidth, y * squareHeight, squareWidth, squareHeight);
    }
  }
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
      blocks[x * ySquareCount + y] = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    }
  }

  requestAnimationFrame(mainLoop);
}

initializeGame();
