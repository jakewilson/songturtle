function Song(audioCtx, audioBuffer) {
  this.audioCtx = audioCtx;
  this.isPlaying = false;
  this.audioBuffer = audioBuffer;
  this.duration = this.audioBuffer.duration;
  this.intervalId = 0;

  /**
   * How often to call this.timeStep()
   */
  this.timeStepMs = 50;

  /**
   * The position in seconds
   */
  this.position = 0;

  this.waveformLength = 500;

  this.waveform = new Waveform(this.audioBuffer, this.waveformLength);

  this.looping = false;
  this.loopStart = 0;
  this.loopEnd = 0;

  /** the time the song was started */
  this.startTime = 0;

  /**
   * Play the song
   * @param offset the position in seconds at which to start the song
   */
  this.play = function(offset) {
    if (this.isPlaying)
      return;

    if (offset === undefined || offset === null) {
      offset = this.position;
    } else {
      this.position = offset;
    }

    this._createBufferSource();
    this.source.start(0, offset);
    this.startTime = this.getCurrentTime();
    this.isPlaying = true;

    this.lastTimeStep = this.startTime;
    // start the song time step
    this.intervalId = setInterval(this.timeStep.bind(this), this.timeStepMs);

    if (this.onStartCallback) {
      this.onStartCallback();
    }
  };

  /**
   * Creates the audio source node. Audio source nodes can only
   * be played once, so we create a new one every time. This is
   * relatively inexpensive: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
   */
  this._createBufferSource = function() {
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.audioBuffer;

    if (this.looping) {
      console.log('setting loop of length: ' + (this.loopEnd - this.loopStart));
      this.source.loop = true;
      this.source.loopStart = this.loopStart;
      this.source.loopEnd = this.loopEnd;
    }

    this.source.connect(this.audioCtx.destination);
  };

  /**
   * Changes the songs position, and stops and starts it again
   *
   * @param position the position to seek to
   */
  this.seek = function(position) {
    this.stop();
    this.play(position);
  };

  /**
   * Stop the song
   */
  this.stop = function() {
    if (!this.isPlaying)
      return;

    clearInterval(this.intervalId);

    // move the position along by however much
    // time has passed since the last timestep
    this.position += this.getCurrentTime() - this.lastTimeStep;

    this.source.stop();
    this.isPlaying = false;

    if (this.onStopCallback) {
      this.onStopCallback();
    }
  };

  /**
   * Resets the songs position to 0, and removes the loop
   * if one exists
   */
  this.reset = function() {
    this.position = 0;
    this.unloop();
  };

  /**
   * Starts a new loop from start to end
   *
   * @param start the start time, in seconds, of the loop
   * @param end the end time, in seconds, of the loop
   */
  this.loop = function(start, end) {
    this.looping = true;
    this.loopStart = start;
    this.loopEnd = end;
  };

  /**
   * Removes the loop from the song
   */
  this.unloop = function() {
    this.looping = false;
    this.loopStart = 0;
    this.loopEnd = 0;
  };

  this.lastTimeStep = 0;

  /**
   * Should only be called by setInterval(). Responsible
   * for keeping track of how much time has passed in the song,
   * stopping the song if it's finished, and other song-related, time sensitive things
   *
   * @param song the context with which to reference variables
   */
  this.timeStep = function() {
    if (!this.isPlaying)
      return;

    this.position += this.getCurrentTime() - this.lastTimeStep;

    if (this.position > this.duration) {
      this.stop();
      this.reset();
    }

    if (this.loop) {
      const loopStart = this.loopStart;
      const loopEnd = this.loopEnd;
      const loopDuration = loopEnd - loopStart;

      if (this.position >= loopEnd) {
        this.position = loopStart + (this.position - loopEnd);
      }
    }

    this.lastTimeStep = this.getCurrentTime();
  };

  /**
   * Returns the current world time, not the current song time. Used for calculating
   * the current song time
   */
  this.getCurrentTime = function() {
    return this.audioCtx.currentTime;
  };

  this.onStartCallback = null;

  /**
   * Sets the onStart function to be called when the song is started
   */
  this.onStart = function(callback) {
    this.onStartCallback = callback;
  };

  this.onStopCallback = null;

  /**
   * Sets the onStop function to be called when the song is stopped
   */
  this.onStop = function(callback) {
    this.onStopCallback = callback;
  };
}
