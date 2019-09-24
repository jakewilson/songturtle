var waveformColor = 'rgb(230, 230, 230)';
var waveformProgressColor = 'rgb(255, 127, 0)';
var waveformSelectedColor = 'rgb(247, 110, 110)';

var canvasMouseX, canvasMouseY;

function drawWaveform(canvas, song) {
  if (canvas == null || song == null || song.waveform == null) {
    console.log('canvas, song, or waveform was null; doing nothing.');
    return;
  }

  const progress = song.timePlayed / 1000;
  const waveform = song.waveform;

  const scale = canvas.height / 2;
  const barWidth = canvas.width / waveform.length;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw background
  ctx.fillStyle = 'rgb(150, 150, 150)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const progressBars = Math.floor((waveform.length / waveform.audioBuffer.duration) * progress);

  // if the mouse is in the canvas, draw all the colors as brighter, as well as make it clear
  // which part of the song the user is selecting
  if (canvasMouseX != null && canvasMouseY != null) {
    // the x coordinate (in waveform "bar" units) of the mouse
    const selectionX = Math.floor(canvasMouseX * (waveform.length / canvas.width));
    const min = Math.min(selectionX, progressBars);
    const max = (min === selectionX) ? progressBars : selectionX;

    ctx.fillStyle = waveformProgressColor;
    for (var i = 0; i < min; i++) {
      drawBar(ctx, (i * barWidth), canvas.height / 2, barWidth, scale * waveform.data[i]);
    }

    ctx.fillStyle = waveformSelectedColor;
    for (var i = min; i < max; i++) {
      drawBar(ctx, (i * barWidth), canvas.height / 2, barWidth, scale * waveform.data[i]);
    }

    ctx.fillStyle = waveformColor;
    for (var i = max; i < waveform.data.length; i++) {
      drawBar(ctx, (i * barWidth), canvas.height / 2, barWidth, scale * waveform.data[i]);
    }
  } else { // mouse is not on the canvas
    ctx.fillStyle = waveformProgressColor;
    for (var i = 0; i < progressBars; i++) {
      drawBar(ctx, (i * barWidth), canvas.height / 2, barWidth, scale * waveform.data[i]);
    }

    ctx.fillStyle = waveformColor;
    for (var i = progressBars; i < waveform.data.length; i++) {
      drawBar(ctx, (i * barWidth), canvas.height / 2, barWidth, scale * waveform.data[i]);
    }
  }
}

function drawBar(context, x, y, width, height) {
  context.fillRect(x, y, width, height);
  context.fillRect(x, y, width, -height);
};
