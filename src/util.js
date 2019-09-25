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


