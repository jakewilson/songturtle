const audioCtx = new (window.AudioContext || window.webkitAudioContext);
const audio = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audio);
track.connect(audioCtx.destination);

var fileInput = document.getElementById('songFile');
fileInput.addEventListener('change', handleFiles);


function onMp3Load(e) {
  // src of the mp3
  var src = e.target.result;
  audio.src = src;
  audio.play();
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
  if (file.name.match(reg) == null) {
    // TODO show wrong file format error here
    console.log(file.name + ' is not an mp3 file.');
    return;
  }
  reader.readAsDataURL(file);
  console.log(file.name);
}
