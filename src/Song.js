function Song(audioBuffer) {
  this.audioCtx = new (window.AudioContext || window.webkitAudioContext);
  this.source = this.audioCtx.createBufferSource();
  this.isPlaying = false;
  this.position = 0;
  this.audioBuffer = audioBuffer;
  this.source.buffer = this.audioBuffer;

  /**
   * Play the song
   * @param offset the position at which to start the song
   */
  this.play = function(offset) {
    offset = offset || 0;
    this.isPlaying = true;
  }
}
