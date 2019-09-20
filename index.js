const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const audio = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audio);
track.connect(audioCtx.destination);

const fileInput = document.getElementById('songFile');
fileInput.addEventListener('change', handleFiles);

function onMp3Load(e) {
  // src of the mp3
  var src = e.target.result;
  audio.src = src;
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
    // TODO show wrong file format error here
    errorDiv.setAttribute('style', 'display: block');
    errorDiv.innerHTML = file.name + ' is not an mp3 file.';
    return;
  } else {
    errorDiv.setAttribute('style', 'display: none');
  }
  reader.readAsDataURL(file);
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
        audio.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        playButton.innerHTML = "<span>Play</span>";
        audio.pause();
        this.dataset.playing = 'false';
    }
});
