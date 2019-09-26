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
   * The amount of time the song has played for in ms
   */
  this.timePlayed = 0;

  this.waveform = new Waveform(this.audioBuffer, 200);

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
      offset = this.timePlayed;
    } else {
      this.timePlayed = offset;
      console.log(`setting time played to ${this.timePlayed}`);
    }

    this._createBufferSource();
    this.source.start(0, offset);
    this.startTime = this.audioCtx.currentTime;
    this.isPlaying = true;

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

    this.source.onended = this.onend.bind(this);

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

  /**
   * Called by the audio context when the song ends
   */
  this.onend = function() {
    this.timePlayed = 0;
    this.stop();
  };

  /**
   * Should only be called by setInterval(). Responsible
   * for keeping track of how much time has passed in the song,
   * stopping the song if it's finished, and other song-related, time sensitive things
   *
   * @param song the context with which to reference variables
   */
  this.timeStep = function(song) {
    song.timePlayed = song.audioCtx.currentTime - song.startTime;
    if (song.loop) {
      const time = song.timePlayed;
      const loopStart = song.loopStart;
      const loopEnd = song.loopEnd;
      const loopDuration = loopEnd - loopStart;

      // every time the song has looped, increment the start time
      // by the loop duration manually. This avoids slowly falling
      // behind when song.timePlayed is greater than loopDuration by
      // an ever increasing amount
      if (song.timePlayed >= loopDuration) {
        song.startTime += loopDuration;
        song.timePlayed = 0;
      }
    }
  };
}
