function Song(audioCtx, audioBuffer) {
  this.audioCtx = audioCtx;
  this.isPlaying = false;
  this.audioBuffer = audioBuffer;
  this.duration = this.audioBuffer.duration;
  this.intervalId = 0;
  this.playback = 1;

  /**
   * How often to call this.timeStep()
   */
  this.timeStepMs = 50;

  /**
   * The position in seconds
   */
  this.position = 0;

  this.waveformLength = 200;

  this.waveform = new Waveform(this.audioBuffer, this.waveformLength);

  this.looping = false;
  this.loopStart = 0;
  this.loopEnd = 0;

  /** the time the song was started */
  this.startTime = 0;

  /**
   * plays the song and calls the onStartCallback if one exists
   * @param offset the position in seconds at which to start the song
   */
  this.play = function(offset) {
    if (this.isPlaying)
      return;

    this._play(offset);

    if (this.onStartCallback) {
      this.onStartCallback();
    }
  };

  /**
   * Plays the song the song
   * @param offset the position in seconds at which to start the song
   */
  this._play = function(offset) {
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
    if (this.playback != 1)
      // if the playback is not 1, we want a timeout since we will constantly
      // be stopping and starting the song every time
      this.intervalId = setTimeout(this.timeStep.bind(this), this.timeStepMs);
    else
      this.intervalId = setInterval(this.timeStep.bind(this), this.timeStepMs);
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
    if (position < 0)
      position = 0;

    if (this.looping) {
      if (position > this.loopEnd) {
        position = this.loopStart + (position - this.loopEnd);
      } else if (position < this.loopStart) {
        position = this.loopStart;
      }
    }

    if (position > this.duration)
      position = this.duration;

    this.position = position;

    if (this.isPlaying) {
      this._stop();
      this._play();
    }
  };

  /**
   * Stop the song
   */
  this.stop = function() {
    if (!this.isPlaying)
      return;

    this._stop();

    if (this.onStopCallback) {
      this.onStopCallback();
    }
  };

  this._stop = function() {
    clearInterval(this.intervalId);

    // move the position along by however much
    // time has passed since the last timestep
    this.position += this.getDelta() * this.playback;

    this.source.stop();
    this.isPlaying = false;
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

    if (this.isPlaying) {
      this._stop();
      this._play();
    }
  };

  this.lastTimeStep = 0;

  /**
   * Should only be called by setInterval(). Responsible
   * for keeping track of how much time has passed in the song,
   * stopping the song if it's finished, and other song-related, time sensitive things
   */
  this.timeStep = function() {
    if (!this.isPlaying)
      return;

    this.position += this.getDelta() * this.playback;

    if (this.position > this.duration) {
      this.stop();
      this.reset();
      return;
    }

    if (this.looping) {
      const loopStart = this.loopStart;
      const loopEnd = this.loopEnd;

      if (this.position >= loopEnd) {
        this.position = loopStart + (this.position - loopEnd);
      }
    }

    this.lastTimeStep = this.getCurrentTime();

    if (this.playback != 1) {
      this._stop();
      this._play();
    }
  };

  /**
   * Returns the difference between the current time and the last time step
   */
  this.getDelta = function() {
    return (this.getCurrentTime() - this.lastTimeStep);
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

  /**
   * Changes the playback of the song and restarts it with the new speed
   *
   * @param playback the new song playback rate
   */
  this.changePlayback = function(playback) {
    this.playback = playback;

    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  };
}
