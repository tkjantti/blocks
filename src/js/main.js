
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


function drawGrid() {
  for (let y = 0; y < ySquareCount; y++) {
    for (let x = 0; x < xSquareCount; x++) {
      ctx.fillStyle = `hsl(200, ${40 + ((x + y) % 2) * 30}%, 20%)`;
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

requestAnimationFrame(mainLoop);
