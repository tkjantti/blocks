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

import { canvas } from "./Graphics.js";
import { listenMouseClicks } from "./Controls.js";
import { Level } from "./Level.js";

const TIME_STEP = 1000 / 60;
const MAX_FRAME = TIME_STEP * 5;

let deltaTimeMs = 0;
let lastTimeStampMs = 0;

const level = new Level();

function gameLoop(ms) {
  requestAnimationFrame(gameLoop);

  deltaTimeMs = Math.min(ms - lastTimeStampMs, MAX_FRAME);
  lastTimeStampMs = ms;

  level.update(deltaTimeMs);

  level.draw();
}

function initializeGame() {
  listenMouseClicks(canvas, level.onClick.bind(level));
}

initializeGame();
requestAnimationFrame(gameLoop);
