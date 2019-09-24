const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

var song;

function onMp3Load(e) {
  audioCtx.decodeAudioData(e.target.result).then(function(audioBuffer) {
    // hide the loading div and show the canvas
    document.getElementById('loadingDiv').setAttribute('style', 'display:none');
    canvas.setAttribute('style', 'display:block');

    song = new Song(audioCtx, audioBuffer, canvas);
    song.waveform.draw(canvas);
  });
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

  // if multiple mp3s are selected, pick the first one
  const file = files[0];
  const reader = new FileReader();

  // show the loading div and hide the canvas
  document.getElementById('loadingDiv').setAttribute('style', 'display:block');
  canvas.setAttribute('style', 'display:none');

  reader.addEventListener('load', onMp3Load);

  // show an error if the file is not an mp3
  const errorDiv = document.getElementById('wrongFileError');
  if (file.name.match(/\.mp3$/) == null) {
    errorDiv.setAttribute('style', 'display: block');
    errorDiv.innerHTML = file.name + ' is not an mp3 file.';
    return;
  } else {
    errorDiv.setAttribute('style', 'display: none');
  }

  reader.readAsArrayBuffer(file);
  console.log(file.name);
}

const playButton = document.querySelector('button');
var drawIntervalMs;
playButton.addEventListener('click', function() {
    // don't bother doing anything if we don't have a song picked yet
    if (song == null)
      return;

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        playButton.innerHTML = "<span>Pause</span>";
        song.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        playButton.innerHTML = "<span>Play</span>";
        song.stop();
        this.dataset.playing = 'false';
    }
});

