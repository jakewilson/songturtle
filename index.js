const audioCtxt = new (window.AudioContext || window.webkitAudioContext);

var fileInput = document.getElementById('songFile');
fileInput.addEventListener('change', handleFiles);

/**
 * Pass the mp3 on to howler
 * If multiple mp3s were selected, pick the first one
 */
function handleFiles() {
  const files = this.files;
  if (files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  console.log(file.name);
}
