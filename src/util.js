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
function parseTime(time) {
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


