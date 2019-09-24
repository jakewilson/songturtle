function Song(audioCtx, audioBuffer) {
  this.audioCtx = audioCtx;
  this.isPlaying = false;
  this.position = 0;
  this.audioBuffer = audioBuffer;
  this.duration = this.audioBuffer.duration;

  this.waveform = new Waveform(this.audioBuffer, 500);

  /**
   * Play the song
   * @param offset the position at which to start the song
   */
  this.play = function(offset) {
    offset = offset || 0;

    // AudioBufferSourceNodes can only be played once
    // so we create a new one every time - this is relatively
    // inexpensive
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioCtx.destination);
    this.source.start(offset);
    this.isPlaying = true;
  };

  /**
   * Stop the song
   */
  this.stop = function() {
    this.source.stop();
    this.isPlaying = false;
  };
}
