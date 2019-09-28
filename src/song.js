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

  /**
   * The amount of time the song has played for in ms
   */
  this.timePlayed = 0;

  this.waveformLength = 200;

  this.waveform = new Waveform(this.audioBuffer, this.waveformLength);

  this.loop = false;
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
      console.log(`setting position to ${this.position}`);
    }

    this._createBufferSource();
    this.source.start(0, offset);
    this.startTime = this.audioCtx.currentTime;
    this.isPlaying = true;

    this.lastTimeStep = this.startTime;
    // start the song time step
    this.intervalId = setInterval(this.timeStep, this.timeStepMs, this);
  };

  /**
   * Creates the audio source node. Audio source nodes can only
   * be played once, so we create a new one every time. This is
   * relatively inexpensive: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
   */
  this._createBufferSource = function() {
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.audioBuffer;

    if (this.loop) {
      console.log('setting loop of length: ' + (this.loopEnd - this.loopStart));
      this.source.loop = true;
      this.source.loopStart = this.loopStart;
      this.source.loopEnd = this.loopEnd;
    }

    this.source.connect(this.audioCtx.destination);
  };

  /**
   * Stop the song
   */
  this.stop = function() {
    if (!this.isPlaying)
      return;

    this.source.stop();
    this.isPlaying = false;

    clearInterval(this.intervalId);
  };

  this.lastTimeStep = 0;

  /**
   * Should only be called by setInterval(). Responsible
   * for keeping track of how much time has passed in the song,
   * stopping the song if it's finished, and other song-related, time sensitive things
   *
   * @param song the context with which to reference variables
   */
  this.timeStep = function(song) {
    song.timePlayed = song.audioCtx.currentTime - song.startTime;
    song.position += song.audioCtx.currentTime - song.lastTimeStep;

    if (song.loop) {
      const loopStart = song.loopStart;
      const loopEnd = song.loopEnd;
      const loopDuration = loopEnd - loopStart;

      if (song.position >= loopEnd) {
        song.position = loopStart + (song.position - loopEnd);
      }
    }

    song.lastTimeStep = audioCtx.currentTime;
  };
}
