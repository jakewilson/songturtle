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
  this.startTime = 0;
  this.stopTime = 0;

  this.start = function(when, offset) {
    this.startTime = Date.now() / 1000;
  };

  this.connect = function(destination) {};

  this.stop = function() {
    this.stopTime = Date.now() / 1000;
  };
}


describe('Song', function() {
  this.timeout(5000);

  let source;
  let song;
  let audioBuffer;
  let waveform;

  before(() => {
    source = new MockAudioBufferSourceNode();

    chai.spy.on(audioCtx, 'createBufferSource', function() {
      return source;
    });

    audioBuffer = new MockAudioBuffer();
    song = new Song(audioCtx, audioBuffer);

    chai.spy.on(song, 'getCurrentTime', function() {
      return Date.now() / 1000;
    });

    waveform = song.waveform;
  });

  it('should init properly', () => {
    assert.typeOf(song, 'object');
    assert(!song.loop, 'loop is true when it should not be');
  });

  it('should play and stop correctly', (done) => {
    song.play();
    setTimeout(() => {
      assert(song.isPlaying, 'song is not playing after calling play()');
      console.log(`position: ${song.position}`);
      song.stop();
      assert(!song.isPlaying, 'song is playing after calling stop()');
      // should be within ~2 ms of each other
      const expectedPos = source.stopTime - source.startTime;
      const timeDif = Math.floor(Math.abs(song.position - expectedPos));
      assert(timeDif <= 0.001, `time difference was greater than 1 ms: ${timeDif}`);
      done();
    }, 3000);
  });

  describe('Waveform', () => {
    it('should have the correct type', () => {
      assert.typeOf(waveform, 'object');
    });

    it ('should have the correct length', () => {
      assert.equal(waveform.length, song.waveformLength);
    });

    it ('should have the correct data', () => {
      assert.equal(waveform.audioBuffer, audioBuffer);

      for (let i = 0; i < waveform.length; i++) {
        assert(waveform.data[i] === 1, `waveform.data[${i}] is not 1\n`);
      }
    });
  });

});
