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
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const newSeconds = Math.floor(seconds % 60);

  return `${minutes}:${padSeconds(newSeconds)}`;
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
 * Parses a time string and returns the time in seconds or -1 if invalid
 * @param time the string to parse
 */
export function parseTime(time) {
  if (time === '') {
    return -1;
  }

  const segments = time.split(":");
  // time can have no colons (just seconds), one colon (minutes and seconds), or two colons
  // (hours, minutes, and seconds)
  if (segments.length > 3) {
    return -1;
  }

  // Enforce zero padding except for first segment
  if (segments.some((segment, index) => index !== 0 && segment.length !== 2)) {
    return -1;
  }

  if (segments.some(i => isNaN(i) || i < 0)) {
    return -1;
  }

  return segments.reverse().reduce((sum, val, idx) => sum + (Math.pow(60, idx) * val), 0);
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
 * @param song the song
 * @param selectionBar the selectionBar
 * @return the time in seconds of the song
 */
export function getSecondsFromSelectionBar(song, selectionBar) {
  return selectionBar * (song.duration / song.waveform.length);
}

/**
 * Given the seconds, return the corresponding canvas waveform bar
 *
 * @param song the song
 * @param seconds the seconds
 * @return the waveform bar number on the canvas
 */
export function getSelectionBarFromSeconds(song, seconds) {
  return Math.floor(seconds * (song.waveform.length / song.duration));
}

/**
 * Returns the "bar" number on the track that the mouse is selecting
 *
 * @param e the event to get the mouse data from
 * @param song the song
 * @param canvas the canvas
 * @return a number between 0 and [waveform.length] specifying which bar is selected
 */
export function getSelectionBar(e, song, canvas) {
  return Math.floor(mousePosToCanvasPos(e.clientX, e.clientY, canvas).x * (song.waveform.length / canvas.width));
}

/**
 * Converts mouse "page" coordinates to canvas coordinates
 *
 * @return an object with two attributes, x and y, of the canvas coordinates
 */
function mousePosToCanvasPos(mouseX, mouseY, canvas) {
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