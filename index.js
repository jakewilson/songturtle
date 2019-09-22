const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const audio = document.querySelector('audio');
const source = audioCtx.createBufferSource();
const track = audioCtx.createMediaElementSource(audio);
track.connect(audioCtx.destination);
source.connect(audioCtx.destination);

const fileInput = document.getElementById('songFile');
fileInput.addEventListener('change', handleFiles);

function onMp3Load(e) {
  // src of the mp3
  var src = e.target.result;
  //audio.src = src;
  audioCtx.decodeAudioData(e.target.result).then(function(audioBuffer) {
    source.buffer = audioBuffer;
    const waveformData = getRMSWaveformData(audioBuffer);
    drawWaveform(waveformData);
  });
}

function drawWaveform(waveformData) {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const scale = canvas.height / 2;
  const barWidth = canvas.width / waveformData.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'red';
  waveformData.forEach((data, idx) => {
    ctx.fillRect((idx * barWidth), canvas.height / 2, barWidth, scale * data);
    ctx.fillRect((idx * barWidth), canvas.height / 2, barWidth, -1 * scale * data);
  });
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

/**
 * If multiple mp3s were selected, pick the first one
 */
function handleFiles() {
  const files = this.files;
  if (files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.addEventListener('load', onMp3Load);
  const reg = /\.mp3$/;
  const errorDiv = document.getElementById('wrongFileError');
  if (file.name.match(reg) == null) {
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
playButton.addEventListener('click', function() {
    // check if context is in suspended state (autoplay policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        playButton.innerHTML = "<span>Pause</span>";
        source.start();
        //audio.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        playButton.innerHTML = "<span>Play</span>";
        source.stop();
        //audio.pause();
        this.dataset.playing = 'false';
    }
});
