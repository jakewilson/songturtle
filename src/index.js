const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const audio = document.querySelector('audio');
const source = audioCtx.createBufferSource();
const track = audioCtx.createMediaElementSource(audio);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
track.connect(audioCtx.destination);
source.connect(audioCtx.destination);

var songPlaying = false;
var drawInterval;
var songDuration;

var waveformData;
var audioBuffer;

function onMp3Load(e) {
  audioCtx.decodeAudioData(e.target.result).then(function(aBuffer) {
    document.getElementById('loadingDiv').setAttribute('style', 'display:none');
    canvas.setAttribute('style', 'display:block');
    audioBuffer = aBuffer;
    source.buffer = audioBuffer;
    waveformData = getRMSWaveformData(audioBuffer);
    drawInitialWaveform(waveformData, canvas);
  });
}

function drawInitialWaveform(waveformData, canvas) {
  const scale = canvas.height / 2;
  const barWidth = canvas.width / waveformData.length;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'red';
  for (var i = playedBars - 1; i < waveformData.length; i++) {
    var data = waveformData[i];
    ctx.fillRect((i * barWidth), canvas.height / 2, barWidth, scale * data);
    ctx.fillRect((i * barWidth), canvas.height / 2, barWidth, -1 * scale * data);
  }
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

/**
 * Accepts an audio buffer, outputs an array of
 * floats equal to the waveform diagram "heights"
 */
function getRMSWaveformData(audioBuffer) {
  const len = audioBuffer.length;
  // the increment to sample the audio buffer at
  const inc = Math.floor(len / waveform_picture_size);
  const numChannels = audioBuffer.numberOfChannels;
  const channelData0 = audioBuffer.getChannelData(0);
  const channelData1 = audioBuffer.getChannelData(1);
  const a = new Float32Array(waveform_picture_size);

  var idx = 0;
  for (var i = 0; i < len; i += inc) {
    var meanSquare = 0;
    for (var j = i; j < (i + inc); j++) {
      meanSquare += (channelData0[j] * channelData0[j]);
      if (numChannels === 2) {
        meanSquare += (channelData1[j] * channelData1[j]);
      }
    }
    a[idx++] = Math.sqrt(meanSquare/inc * numChannels);
  }

  return a;
}

const fileInput = document.getElementById('songFile');
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

  document.getElementById('loadingDiv').setAttribute('style', 'display:block');
  canvas.setAttribute('style', 'display:none');

  reader.addEventListener('load', onMp3Load);
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
    // check if context is in suspended state (autoplay policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        playButton.innerHTML = "<span>Pause</span>";
        source.start();
        songPlaying = true;
        // convert from seconds to ms
        drawIntervalMs = Math.floor(audioBuffer.duration/waveform_picture_size * 1000);
        console.log("interval: " + drawIntervalMs);
        lastCall = Date.now();
        drawInterval = setInterval(
          drawWaveformProgress,
          drawIntervalMs,
          waveformData, canvas // args to pass drawWaveform()
          );
        //time = Date.now();
        //drawInterval = setInterval(printBars, duration);
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        playButton.innerHTML = "<span>Play</span>";
        source.stop();
        songPlaying = false;
        clearInterval(drawInterval);
        this.dataset.playing = 'false';
    }
});

