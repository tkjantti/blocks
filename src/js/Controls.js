
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

    if (0 <= x && x < (element.width * xr) && 0 <= y && y < (element.height * xr)) {
      handler(x, y);
    }
  }

  document.addEventListener('mouseup', mouseUp, false);
}
