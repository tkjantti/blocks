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

/*
 * Listens for mouse clicks on top of the given element.
 */
export function listenMouseClicks(element, handler) {
  function mouseUp(e) {
    const rect = element.getBoundingClientRect();
    const xr = element.width / element.clientWidth;
    const yr = element.height / element.clientHeight;
    let x = (e.clientX - rect.left) * xr;
    let y = (e.clientY - rect.top) * yr;

    if (0 <= x && x < element.width * xr && 0 <= y && y < element.height * xr) {
      handler(x, y);
    }
  }

  document.addEventListener("mouseup", mouseUp, false);
}
