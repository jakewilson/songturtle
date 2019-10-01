/**
 * An object to render a waveform
 */
function Renderer(canvas, song) {
  this.waveformColor         = 'rgb(230, 230, 230)';
  this.waveformProgressColor = 'rgb(255, 127, 0)';
  this.waveformSelectedColor = 'rgb(247, 110, 110)';

  this.loopColor         = 'rgb(0, 255, 150)';
  this.loopProgressColor = 'rgb(100, 0, 200)';

  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.song = song;
  this.waveform = song.waveform;

  this.selectionBar = null;

  // the user-selected loop in "selection bar" coordinates
  this.loopStart = null;
  this.loopEnd = null;

  /**
   * Draws the waveform
   *
   * @param renderer [optional] used for when this function is called on an interval, this
   *        will be the context, since `this` cannot be used. Defaults to `this`
   */
  this.drawWaveform = function(renderer) {
    renderer = renderer || this;

    if (renderer.canvas == null || renderer.song == null || renderer.waveform == null) {
      console.log('canvas, song, or waveform was null; doing nothing.');
      return;
    }

    const progress = renderer.song.position;

    renderer.ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);

    // draw background
    renderer.ctx.fillStyle = 'rgb(150, 150, 150)';
    renderer.ctx.fillRect(0, 0, renderer.canvas.width, renderer.canvas.height);

    const progressBars = Math.floor((renderer.waveform.length / renderer.waveform.audioBuffer.duration) * progress);

    if (renderer.song.looping === false) {
      // make it clear which part of the song the user is selecting
      if (renderer.selectionBar !== null) {
        // the x coordinate (in waveform "bar" units) of the mouse
        const min = Math.min(renderer.selectionBar, progressBars);
        const max = (min === renderer.selectionBar) ? progressBars : renderer.selectionBar;

        renderer._drawBars(renderer.waveformProgressColor, 0, min);
        renderer._drawBars(renderer.waveformSelectedColor, min, max);
        renderer._drawBars(renderer.waveformColor, max);
      } else {
        renderer._drawBars(renderer.waveformProgressColor, 0, progressBars);
        renderer._drawBars(renderer.waveformColor, progressBars);
      }

      // draw the selected loop
      if (renderer.loopStart !== null && renderer.loopEnd !== null) {
        const loopStart = Math.min(renderer.loopStart, renderer.loopEnd);
        const loopEnd   = Math.max(renderer.loopStart, renderer.loopEnd);

        renderer._drawBars(renderer.loopColor, loopStart, loopEnd + 1);
      }
    } else { // the song is looping
      // draw the selected loop
      if (renderer.loopStart !== null && renderer.loopEnd !== null) {
        renderer._drawBars(renderer.waveformColor, 0, renderer.loopStart);

        renderer._drawBars(renderer.loopProgressColor, renderer.loopStart, progressBars + 1);
        renderer._drawBars(renderer.loopColor, progressBars + 1, renderer.loopEnd + 1);

        renderer._drawBars(renderer.waveformColor, renderer.loopEnd + 1);
      }
    }

  }

  /**
   * Draws waveform data in the specified color for the range [from, to) in this.waveform.data
   *
   * @param color the color to draw in
   * @param from the index to start at (inclusive)
   * @param to [optional] the index to end at (exclusive) this will default to the length of
   *        the waveform if unspecified
   */
  this._drawBars = function(color, from, to) {
    // we do it this way and not like `to = to || this.waveform.length` because
    // we want to use it if it's 0
    if (to === undefined || to === null)
      to = this.waveform.length;

    const scale = this.canvas.height / 2;
    const barWidth = this.canvas.width / this.waveform.length;

    this.ctx.fillStyle = color;
    for (var i = from; i < to; i++) {
      this._drawBar(this.ctx, (i * barWidth), this.canvas.height / 2, barWidth, scale * this.waveform.data[i]);
    }

  }

  /**
   * Draws a "bar" in a reflected style. Draws the specified rectangle, then another reflected in
   * in the opposite direction
   */
  this._drawBar = function(context, x, y, width, height) {
    context.fillRect(x, y, width, height);
    context.fillRect(x, y, width, -height);
  };
}
