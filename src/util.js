/**
 * File for various utility functions
 */

/**
 * Takes a number in seconds and returns a string in mm:ss format
 * formatTime(60)  -> '1:00'
 * formatTime(123) -> '2:03'
 *
 * @param seconds the seconds to format
 * @return the formatted time
 */
function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var seconds = Math.ceil(seconds % 60);

  if (seconds == 60) {
    seconds = 0;
    minutes++;
  }

  return `${minutes}:${padSeconds(seconds)}`;
}

/**
 * Pads the seconds with a 0 if less than 10
 * padSeconds(2)  -> '02'
 * padSeconds(20) -> 20
 *
 * @param seconds
 */
function padSeconds(seconds) {
  if (seconds < 10) {
    return `0${seconds}`;
  }

  return seconds;
}

/**
 * Sets an elements display to the passed in value
 *
 * @param elem either the element object or an id string specifying which
 *        object to show
 * @param display [optional] defaults to 'block', but can be something else,
 *        like 'fixed' or 'absolute'
 */
function showElement(elem, display) {
  display = display || 'block';

  if (typeof elem === 'string')
    elem = document.getElementById(elem);

  elem.setAttribute('style', `display:${display}`);
}

/**
 * Sets an elements display to 'none'
 *
 * @param elem either the element object or an id string specifying which
 *        object to show
 */
function hideElement(elem) {
  if (typeof elem === 'string')
    elem = document.getElementById(elem);

  elem.setAttribute('style', 'display:none');
}

/**
 * Given a canvas selectionBar, return the number of
 * seconds it corresponds to in the song
 *
 * @param selectionBar the selectionBar
 * @return the time in seconds of the song
 */
function getSecondsFromSelectionBar(selectionBar) {
  return selectionBar * (song.duration / song.waveform.length);
}

/**
 * Returns the "bar" number on the track that the mouse is selecting
 *
 * @param e the event to get the mouse data from
 * @return a number between 0 and [waveform.length] specifying which bar is selected
 */
function getSelectionBar(e) {
  return Math.floor(mousePosToCanvasPos(e.clientX, e.clientY).x * (song.waveform.length / canvas.width));
}

/**
 * Converts mouse "page" coordinates to canvas coordinates
 *
 * @return an object with two attributes, x and y, of the canvas coordinates
 */
function mousePosToCanvasPos(mouseX, mouseY) {
  // the "bounding rectangle" of the canvas - this contains
  // the canvas coordinates relative to the page
  const boundingRect = canvas.getClientRects()[0];

  // this will give us the mouse position relative to the canvas in page
  // coordinates
  mouseX -= boundingRect.x;
  mouseY -= boundingRect.y;

  // now convert the page coordinates to canvas coordinates - where in the viewport
  // the mouse was clicked
  return {
    x: mouseX * (canvas.width / boundingRect.width),
    y: mouseY * (canvas.height / boundingRect.height)
  };
}

