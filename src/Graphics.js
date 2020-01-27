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

export function drawScore(number) {
  const text = number.toString();

  ctx.font = "40px Sans-serif";

  const textWidth = ctx.measureText(text).width;
  const textAreaWidth = 300;
  const x = canvas.width - textWidth - 20;
  const y = 50;

  ctx.fillStyle = "lightblue";
  ctx.globalAlpha = 0.1;
  ctx.fillRect(canvas.width - textAreaWidth, 0, textAreaWidth, 70);

  ctx.fillStyle = "blue";
  ctx.globalAlpha = 1;
  ctx.fillText(text, x, y);
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
