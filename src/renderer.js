/**
 * An object to render a waveform
 */
function Renderer(canvas, song) {
  this.waveformColor         = '#000000';
  this.waveformProgressColor = '#ef8a17';
  this.waveformSelectedColor = '#ef2917';

  this.loopColor         = '#008148';
  this.loopProgressColor = '#c6c013';

  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.song = song;
  this.waveform = song.waveform;
  this.padding = 1;
  this.scale = ((this.canvas.height / 2) - 1) / this.waveform.maxData;
  this.barWidth = (this.canvas.width / this.waveform.length) - this.padding;

  this.selectionBar = null;

  // the user-selected loop in "selection bar" coordinates
  this.loopStart = null;
  this.loopEnd = null;

  this.selectionStart = null;
  this.selectionEnd = null;

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
    renderer.ctx.fillStyle = '#ffffff';
    renderer.ctx.fillRect(0, 0, renderer.canvas.width, renderer.canvas.height);

    const progressBars = Math.ceil((renderer.waveform.length / renderer.waveform.audioBuffer.duration) * progress);

    if (!renderer.song.looping) {
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
      if (renderer.selectionStart !== null && renderer.selectionEnd !== null) {
        const loopStart = Math.min(renderer.selectionStart, renderer.selectionEnd);
        const loopEnd   = Math.max(renderer.selectionStart, renderer.selectionEnd);

        renderer._drawBars(renderer.loopColor, loopStart, loopEnd + 1);
      }
    } else {
      // draw the loop
      if (renderer.loopStart !== null && renderer.loopEnd !== null) {
        renderer._drawBars(renderer.waveformColor, 0, renderer.loopStart);

        renderer._drawBars(renderer.loopProgressColor, renderer.loopStart, progressBars);
        renderer._drawBars(renderer.loopColor, progressBars, renderer.loopEnd);

        renderer._drawBars(renderer.waveformColor, renderer.loopEnd);
      }

      // draw the selected loop
      if (renderer.selectionStart !== null && renderer.selectionEnd !== null) {
        const loopStart = Math.min(renderer.selectionStart, renderer.selectionEnd);
        const loopEnd   = Math.max(renderer.selectionStart, renderer.selectionEnd);

        renderer._drawBars(renderer.loopColor, loopStart, loopEnd + 1);
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

    this.ctx.fillStyle = color;
    for (var i = from; i < to; i++) {
      this._drawBar(this.ctx, (i * this.barWidth) + (i * this.padding), this.canvas.height / 2, this.barWidth, this.scale * this.waveform.data[i]);
    }
  }

  /**
   * Draws a "bar" in a reflected style. Draws the specified rectangle, then another reflected in
   * in the opposite direction
   */
  this._drawBar = function(context, x, y, width, height) {
    context.fillRect(x + this.padding, y, width, height);
    context.fillRect(x + this.padding, y, width, -height);
  };
}
