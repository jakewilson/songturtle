/**
 * A waveform
 * @param audioBuffer the audio buffer to generate the waveform for
 * @param length the length of the waveform; i.e. how many "bars" to draw 
 *        for a visual representation. The longer the length, the more
 *        accurate the waveform.
 */
export default function Waveform(audioBuffer, length) {
  this.audioBuffer = audioBuffer;
  this.length = length;
  this.maxData = 0;

  /**
   * Calculates the root mean square for [this.length] samples of the
   * audio PCM data.
   * Because audio files contain so many samples, this is how we represent
   * a song with only [this.length] numbers:
   *    1. Divide the song length by the waveform length - this will be our increment
   *    2. Step through the channel data by [increment]. For each chunk with size == increment, calculate the
           root mean square and add it to the final data array.
   *    3. These chunks are our waveform
   */
  this.rms = function() {
    this.maxData = -Infinity;
    const songLength = this.audioBuffer.length;
    // the increment to sample the audio buffer at
    const inc = Math.floor(songLength / this.length);

    const numChannels = this.audioBuffer.numberOfChannels;
    const channelData = [];
    for (let channel = 0; channel < numChannels; channel++) {
      channelData.push(this.audioBuffer.getChannelData(channel));
    }

    const data = new Float32Array(this.length);

    let dataIdx = 0;
    for (let i = 0; i < songLength; i += inc) {
      var meanSquare = 0;
      for (let j = i; j < (i + inc); j++) {
        for (let channel = 0; channel < numChannels; channel++) {
          meanSquare += (channelData[channel][j] * channelData[channel][j]);
        }
      }
      const rmsVal = Math.sqrt(meanSquare / (inc * numChannels));
      data[dataIdx++] = rmsVal;

      // save the peak value for rendering
      if (rmsVal > this.maxData)
        this.maxData = rmsVal;
    }

    return data;
  };

  this.data = this.rms();
}
