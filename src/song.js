function Song(audioCtx, audioBuffer) {
  this.audioCtx = audioCtx;
  this.audioBuffer = audioBuffer;
  this.duration = this.audioBuffer.duration;
  this.intervalId = 0;

  this.BUFFER_SIZE = 4096;
  this.FRAME_SIZE = 2048;

  this.playback = 1;

  // units are # of frames processed
  this.position = 0;
  this.isPlaying = false;

  var _node = this.audioCtx.createScriptProcessor(this.BUFFER_SIZE, 2);
  
  // phase vocoder for changing speed seamlessly
  var _pv = new BufferedPV(this.FRAME_SIZE);

  _pv.set_audio_buffer(this.audioBuffer);
  var _nodePos = 0;

  this.onAudioProcess = function(e) {
    if (this.isPlaying) {
      console.log('heya');
      _pv.alpha = this.playback;

      if (_nodePos != undefined) {
        _pv.position = _nodePos;
        _nodePos = undefined;
      }

      _pv.process(e.outputBuffer);
      this.position = _pv.position / 44100;

      if (this.position > this.duration) {
        this.stop();
        this.reset();
      }
    }
  };

  _node.onaudioprocess = this.onAudioProcess.bind(this);

  /**
   * How often to call this.timeStep()
   */
  this.timeStepMs = 50;

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

  this.gain = this.audioCtx.createGain();

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

    _node.connect(this.gain);
    this.gain.connect(this.audioCtx.destination);
    this.isPlaying = true;
  };

  /**
   * Changes the songs position, and stops and starts it again
   *
   * @param position the position to seek to in seconds
   */
  this.seek = function(position) {
    if (position < 0)
      position = 0;

    position *= 44100;

    if (this.looping) {
      if (position > this.loopEnd) {
        position = this.loopStart + (position - this.loopEnd);
      } else if (position < this.loopStart) {
        position = this.loopStart;
      }
    }

    _nodePos = position;
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
    _node.disconnect();
    this.isPlaying = false;
  };

  /**
   * Resets the songs position to 0, and removes the loop
   * if one exists
   */
  this.reset = function() {
    _nodePos = 0;
    _pv = new BufferedPV(this.FRAME_SIZE);

    _pv.set_audio_buffer(this.audioBuffer);
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
