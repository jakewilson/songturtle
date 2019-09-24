const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// the song to be played
var song;
var drawInterval;
var waveformData;

function onMp3Load(e) {
  audioCtx.decodeAudioData(e.target.result).then(function(audioBuffer) {
    // hide the loading div and show the canvas
    document.getElementById('loadingDiv').setAttribute('style', 'display:none');
    canvas.setAttribute('style', 'display:block');

    song = new Song(audioCtx, audioBuffer);
    waveformData = song.waveform.data;
    song.waveform.draw(canvas);
  });
}

// the number of bars that have been 'played' - these bars represent the
// progress of the song so far
var playedBars = 0;
var lastCall = 0;
function drawWaveformProgress(waveformData, canvas) {
  const scale = canvas.height / 2;
  const barWidth = canvas.width / waveformData.length;
  const ctx = canvas.getContext('2d');
  const delta = Date.now() - lastCall;
  playedBars += delta / drawIntervalMs;
  if (Math.floor(playedBars) == waveformData.length) console.log("DONE!!!");
  lastCall = Date.now();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'orange';
  for (var i = 0; i < playedBars; i++) {
    var data = waveformData[i];
    ctx.fillRect((i * barWidth), canvas.height / 2, barWidth, scale * data);
    ctx.fillRect((i * barWidth), canvas.height / 2, barWidth, -1 * scale * data);
  }

  ctx.fillStyle = 'red';
  for (var i = Math.ceil(playedBars); i < waveformData.length; i++) {
    var data = waveformData[i];
    ctx.fillRect((i * barWidth), canvas.height / 2, barWidth, scale * data);
    ctx.fillRect((i * barWidth), canvas.height / 2, barWidth, -1 * scale * data);
  }
}

const waveform_picture_size = 500;

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
        // convert from seconds to ms
        drawIntervalMs = Math.floor(song.duration/waveform_picture_size * 1000);
        console.log("interval: " + drawIntervalMs);
        lastCall = Date.now();
        drawInterval = setInterval(
          drawWaveformProgress,
          drawIntervalMs,
          waveformData, canvas // args to pass drawWaveform()
          );
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        playButton.innerHTML = "<span>Play</span>";
        song.stop();
        clearInterval(drawInterval);
        this.dataset.playing = 'false';
    }
});

