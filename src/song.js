function Song(audioCtx, audioBuffer, canvas) {
  this.audioCtx = audioCtx;
  this.isPlaying = false;
  this.audioBuffer = audioBuffer;
  this.duration = this.audioBuffer.duration;
  this.canvas = canvas;
  this.intervalId = 0;

  /**
   * How often to call this.timeStep()
   */
  this.timeStepMs = 20;

  /**
   * The amount of time the song has played for in ms
   */
  this.timePlayed = 0;

  this.waveform = new Waveform(this.audioBuffer, 500);

  /**
   * Play the song
   * @param offset the position in seconds at which to start the song
   */
  this.play = function(offset) {
    offset = offset || 0;

    // AudioBufferSourceNodes can only be played once
    // so we create a new one every time - this is relatively
    // inexpensive
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioCtx.destination);
    this.source.start(0, this.timePlayed / 1000);
    this.isPlaying = true;

    // start the song time step
    this.lastTimeStep = Date.now();
    this.intervalId = setInterval(this.timeStep, this.timeStepMs, this);
  };

  /**
   * Stop the song
   */
  this.stop = function() {
    this.source.stop();
    this.isPlaying = false;

    clearInterval(this.intervalId);
  };

  /**
   * Time of last call to timeStep()
   */
  this.lastTimeStep = 0;

  /**
   * Should only be called by setInterval(). Responsible
   * for keeping track of how much time has passed in the song,
   * drawing the updated waveform, stopping the song if it's finished
   * and other song-related, time sensitive things
   *
   * @param ctx the context with which to reference variables
   */
  this.timeStep = function(ctx) {
    // if lastTimeStep is 0,this function was called
    // incorrectly, so just return
    if (ctx.lastTimeStep === 0)
      return;

    const delta = Date.now() - ctx.lastTimeStep;
    ctx.timePlayed += delta;

    ctx.lastTimeStep = Date.now();

    ctx.waveform.draw(ctx.canvas, ctx.timePlayed / 1000);

    if (Math.floor(ctx.timePlayed / 1000) >= ctx.duration) {
      ctx.stop();
      // reset the song
      ctx.timePlayed = 0;
    }
  };
}
