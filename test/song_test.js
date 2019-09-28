const audioCtx = new (window.AudioContext || window.webkitAudioContext);

function MockAudioBuffer() {
  this.duration = 60;
  this.numberOfChannels = 2;
  this.sampleRate = 44100;
  this.length = this.sampleRate * this.duration;

  this.getChannelData = function(channel) {
    return Array(this.length).fill(1);
  };
}

function MockAudioBufferSourceNode() {
  this.start = function(when, offset) {};
  this.connect = function(destination) {};
}

chai.spy.on(audioCtx, 'createBufferSource', function() {
  return new MockAudioBufferSourceNode();
});

describe('Song', function() {
  let song;
  let audioBuffer;
  let waveform;
  before(() => {
    audioBuffer = new MockAudioBuffer();
    song = new Song(audioCtx, audioBuffer);
    waveform = song.waveform;
  });

  it('should init properly', () => {
    assert.typeOf(song, 'object');
  });

  it('should create correct waveform', () => {
    assert.typeOf(waveform, 'object');
    assert.equal(waveform.length, song.waveformLength);
    assert.equal(waveform.audioBuffer, audioBuffer);
    for (let i = 0; i < waveform.length; i++) {
      assert(waveform.data[i] === 1, `waveform.data[${i}] is not 1\n`);
    }
  });

});
