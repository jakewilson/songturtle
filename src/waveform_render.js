var waveformColor = 'rgb(230, 230, 230)';
var waveformProgressColor = 'rgb(255, 127, 0)';
var waveformSelectedColor = 'rgb(247, 110, 110)';

var selectionBar;

function drawWaveform(canvas, song) {
  if (canvas == null || song == null || song.waveform == null) {
    console.log('canvas, song, or waveform was null; doing nothing.');
    return;
  }

  const ctx = canvas.getContext('2d');
  const progress = song.timePlayed / 1000;
  const waveform = song.waveform;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw background
  ctx.fillStyle = 'rgb(150, 150, 150)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const progressBars = Math.floor((waveform.length / waveform.audioBuffer.duration) * progress);

  // make it clear which part of the song the user is selecting
  if (selectionBar != null) {
    // the x coordinate (in waveform "bar" units) of the mouse
    const min = Math.min(selectionBar, progressBars);
    const max = (min === selectionBar) ? progressBars : selectionBar;

    drawBars(canvas, waveformProgressColor, waveform, 0, min);
    drawBars(canvas, waveformSelectedColor, waveform, min, max);
    drawBars(canvas, waveformColor, waveform, max);
  } else {
    drawBars(canvas, waveformProgressColor, waveform, 0, progressBars);
    drawBars(canvas, waveformColor, waveform, progressBars);
  }
}

function mouseIsOnCanvas(mouseX, mouseY) {
  return mouseX != null && mouseY != null;
}

function drawBars(canvas, color, waveform, from, to) {
  // we do it this way and not like `to = to || waveform.length` because
  // we want to use it if it's 0
  if (to === undefined || to === null)
    to = waveform.length;

  const scale = canvas.height / 2;
  const barWidth = canvas.width / waveform.length;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  for (var i = from; i < to; i++) {
    drawBar(ctx, (i * barWidth), canvas.height / 2, barWidth, scale * waveform.data[i]);
  }

}

function drawBar(context, x, y, width, height) {
  context.fillRect(x, y, width, height);
  context.fillRect(x, y, width, -height);
};
