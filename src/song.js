function Song(audioCtx, audioBuffer) {
  this.audioCtx = audioCtx;
  this.isPlaying = false;
  this.audioBuffer = audioBuffer;
  this.duration = this.audioBuffer.duration;
  this.intervalId = 0;

  /**
   * How often to call this.timeStep()
   */
  this.timeStepMs = 20;

  /**
   * The amount of time the song has played for in ms
   */
  this.timePlayed = 0;

  this.waveform = new Waveform(this.audioBuffer, 200);

  /**
   * Play the song
   * @param offset the position in seconds at which to start the song
   */
  this.play = function(offset) {
    if (offset === undefined || offset === null) {
      offset = (this.timePlayed / 1000);
    } else {
      this.timePlayed = offset * 1000;
    }

    this._createBufferSource();
    this.source.start(0, offset);
    this.isPlaying = true;

    // start the song time step
    this.lastTimeStep = Date.now();
    this.intervalId = setInterval(this.timeStep, this.timeStepMs, this);
  };

  this._createBufferSource = function() {
    // AudioBufferSourceNodes can only be played once
    // so we create a new one every time - this is relatively
    // inexpensive
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioCtx.destination);
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
   * stopping the song if it's finished, and other song-related, time sensitive things
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

    if (Math.floor(ctx.timePlayed / 1000) >= ctx.duration) {
      ctx.stop();
      // reset the song
      ctx.timePlayed = 0;
    }
  };
}
