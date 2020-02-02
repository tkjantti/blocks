/*
 * Copyright (c) 2019 Tero Jäntti
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { BLOCK_RED, BLOCK_YELLOW, BLOCK_GREEN } from "./Block.js";

export const canvas = document.querySelector("#board canvas");

const ctx = canvas.getContext("2d");

export const squareWidth = 32;
export const squareHeight = 32;

function getColor(blockType) {
  switch (blockType) {
    case BLOCK_RED:
      return "red";
    case BLOCK_YELLOW:
      return "yellow";
    case BLOCK_GREEN:
      return "green";
    default:
      return "black";
  }
}

function drawBackground(array2D) {
  for (let x = 0; x < array2D.xCount; x++) {
    for (let y = 0; y < array2D.yCount; y++) {
      ctx.fillStyle = `hsl(200, ${40 + ((x + y) % 2) * 30}%, 20%)`;
      ctx.fillRect(
        x * squareWidth,
        y * squareHeight,
        squareWidth,
        squareHeight
      );
    }
  }
}

export function drawGrid(grid, animState) {
  const array2D = grid.array;

  drawBackground(array2D);

  for (let x = 0; x < array2D.xCount; x++) {
    for (let y = 0; y < array2D.yCount; y++) {
      const block = array2D.getValue(x, y);

      if (block) {
        const yShift = Math.min(animState.yShift, block.yShift) * squareHeight;
        const xShift = Math.min(animState.xShift, block.xShift) * squareWidth;

        ctx.fillStyle = getColor(block.type);
        ctx.fillRect(
          x * squareWidth + xShift,
          y * squareHeight - yShift,
          squareWidth,
          squareHeight
        );
      }
    }
  }
}

function drawTime(ms) {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  const pad = seconds < 10 ? "0" : "";

  const text = `${minutes}:${pad}${seconds}`;

  ctx.font = "40px Sans-serif";
  ctx.fillStyle = "blue";

  const textWidth = ctx.measureText(text).width;
  const x = canvas.width / 2 - textWidth / 2;
  const y = 50;

  ctx.fillText(text, x, y);
}

function drawTotalScore(number) {
  const text = number.toString();

  ctx.font = "30px Sans-serif";

  const textWidth = ctx.measureText(text).width;
  const x = canvas.width - textWidth - 20;
  const y = 30;

  ctx.fillStyle = "purple";
  ctx.fillText(text, x, y);
}

function drawTargetScore(number) {
  ctx.font = "30px Sans-serif";
  ctx.fillStyle = "purple";
  ctx.fillText("Target:", 20, 30);

  ctx.font = "50px Sans-serif";
  ctx.fillStyle = "purple";
  ctx.fillText(number.toString(), 20, 80);
}

export function drawUi(ms, totalScore, targetScore) {
  ctx.fillStyle = "lightblue";
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, canvas.width, 100);
  ctx.globalAlpha = 1.0;

  drawTime(ms);
  drawTotalScore(totalScore);
  drawTargetScore(targetScore);
}

export function drawText(text) {
  ctx.font = "60px Sans-serif";

  const textWidth = ctx.measureText(text).width;
  const textAreaWidth = textWidth * 1.2;
  const textAreaHeight = 100;
  const x = canvas.width / 2 - textWidth / 2;
  const y = canvas.height * 0.45;

  ctx.fillStyle = "lightblue";
  ctx.globalAlpha = 0.4;
  ctx.fillRect(
    canvas.width / 2 - textAreaWidth / 2,
    canvas.height / 2 - textAreaHeight,
    textAreaWidth,
    textAreaHeight
  );

  ctx.fillStyle = "white";
  ctx.globalAlpha = 1;

  ctx.fillText(text, x, y);
}
