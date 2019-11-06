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
   */
  this.drawWaveform = function() {
    if (this.canvas == null || this.song == null || this.waveform == null) {
      console.log('canvas, song, or waveform was null; doing nothing.');
      return;
    }

    const progress = this.song.position;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const progressBars = Math.ceil((this.waveform.length / this.waveform.audioBuffer.duration) * progress);

    if (!this.song.looping) {
      // make it clear which part of the song the user is selecting
      if (this.selectionBar !== null) {
        // the x coordinate (in waveform "bar" units) of the mouse
        const min = Math.min(this.selectionBar, progressBars);
        const max = (min === this.selectionBar) ? progressBars : this.selectionBar;

        this._drawBars(this.waveformProgressColor, 0, min);
        this._drawBars(this.waveformSelectedColor, min, max);
        this._drawBars(this.waveformColor, max);
      } else {
        this._drawBars(this.waveformProgressColor, 0, progressBars);
        this._drawBars(this.waveformColor, progressBars);
      }

      // draw the selected loop
      if (this.selectionStart !== null && this.selectionEnd !== null) {
        const loopStart = Math.min(this.selectionStart, this.selectionEnd);
        const loopEnd   = Math.max(this.selectionStart, this.selectionEnd);

        this._drawBars(this.loopColor, loopStart, loopEnd + 1);
      }
    } else {
      // draw the loop
      if (this.loopStart !== null && this.loopEnd !== null) {
        this._drawBars(this.waveformColor, 0, this.loopStart);

        this._drawBars(this.loopProgressColor, this.loopStart, progressBars);
        this._drawBars(this.loopColor, progressBars, this.loopEnd);

        this._drawBars(this.waveformColor, this.loopEnd);
      }

      // draw the selected loop
      if (this.selectionStart !== null && this.selectionEnd !== null) {
        const loopStart = Math.min(this.selectionStart, this.selectionEnd);
        const loopEnd   = Math.max(this.selectionStart, this.selectionEnd);

        this._drawBars(this.loopColor, loopStart, loopEnd + 1);
      }
    }

    window.requestAnimationFrame(this.drawWaveform.bind(this));
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

export default Renderer;