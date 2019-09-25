const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

var song;
var drawInterval, clockInterval;

function onMp3Load(e) {
  audioCtx.decodeAudioData(e.target.result, songInit, songInitError);
}

function songInit(audioBuffer) {
  // hide the loading div and show the canvas
  hideElement('loadingDiv');
  showElement(canvas);

  song = new Song(audioCtx, audioBuffer, canvas);
  drawWaveform(canvas, song);

  var timeSpan = document.getElementById('timeSpan');
  timeSpan.innerHTML = `0:00/${formatTime(song.duration)}`;
  showElement(timeSpan);
}

function songInitError(error) {
  hideElement('loadingDiv');
  const errorDiv = document.getElementById('errorDiv');
  showElement(errorDiv);
  errorDiv.innerHTML = 'Error decoding song';
  console.log('error decoding song');
}

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', getFile);

/**
 * Loads the file selected by the user. If it is not an mp3, show an error and don't
 * load the file.
 */
function getFile() {
  const files = this.files;
  if (files.length === 0)
    return;

  // make sure we don't play more than one song at the same time
  if (song) {
    stopSong();
    song = null;
  }

  // if multiple mp3s are selected, pick the first one
  const file = files[0];
  const reader = new FileReader();

  // show the loading div and hide the canvas
  showElement('loadingDiv');
  hideElement(canvas);
  hideElement('timeSpan');

  reader.addEventListener('load', onMp3Load);

  // show an error if the file is not an mp3
  const errorDiv = document.getElementById('errorDiv');
  if (file.name.match(/\.mp3$/) == null) {
    showElement(errorDiv);
    errorDiv.innerHTML = file.name + ' is not an mp3 file.';
    hideElement('loadingDiv');
    return;
  } else {
    hideElement(errorDiv);
  }

  reader.readAsArrayBuffer(file);
  console.log(file.name);
}


const playButton = document.querySelector('button');
playButton.addEventListener('click', function() {
    // don't bother doing anything if we don't have a song picked yet
    if (song == null)
      return;

    if (!song.isPlaying) {
      playSong();
    } else {
      stopSong();
    }
});

/**
 * Plays the song, changes DOM elements, and starts some intervals
 */
function playSong() {
  if (song === null) {
    console.log('tried to play the song but it was null');
    return;
  }

  playButton.innerHTML = "<span>Pause</span>";
  song.play();
  drawInterval = setInterval(drawWaveform, 40, canvas, song);
  clockInterval = setInterval(updateClock, 500, song);
}

/**
 * Stops the song, changes DOM elements, and clears some intervals
 */
function stopSong() {
  if (song === null) {
    console.log('tried to stop the song but it was null');
    return;
  }

  playButton.innerHTML = "<span>Play</span>";
  song.stop();
  clearInterval(drawInterval);
  clearInterval(clockInterval);
}

/*
 * The number of seconds elapsed to show on the track clock. This will
 * normally be the seconds elapsed in the song, but will change if the
 * user is hovering the mouse over the track to show the time of the
 * mouse position
 */
var clockSeconds = null;

/**
 * Updates the clock above the music player. Should be called
 * on an interval while the song is playing. Can also be called
 * if a function needs to update the clock immediately and can't
 * wait for the interval
 *
 * @param song the song
 */
function updateClock(song) {
  var seconds = clockSeconds;
  if (seconds === null) {
    seconds = song.timePlayed / 1000;
  }

  seconds = formatTime(seconds);

  var clock = document.getElementById('timeSpan');
  clock.innerHTML = seconds + "/" + formatTime(song.duration);
}

canvas.addEventListener('mousemove', function(e) {
  if (song.isPlaying) {
    const ctx = canvas.getContext('2d');
    selectionBar = getSelectionBar(e);
    clockSeconds = getSecondsFromSelectionBar(selectionBar);
    updateClock(song);
  }
});

canvas.addEventListener('mouseleave', function(e) {
  selectionBar = null;
  clockSeconds = null;
  updateClock(song);
});

canvas.addEventListener('mousedown', function(e) {
  if (!song.isPlaying) {
    playSong();
    return;
  }

  var selection = getSelectionBar(e);
  // convert the selection bar into actual seconds, then jump to that time
  var offset = getSecondsFromSelectionBar(selection);
  song.stop();
  song.play(offset);
  updateClock(song);
});
