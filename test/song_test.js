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

  beforeEach(() => {
    song.stop();
    song.reset();
  });

  it('should init properly', () => {
    assert.typeOf(song, 'object');
    assert(!song.looping, 'looping is true when it should not be');
  });

  it('should set loop conditions correctly', () => {
    const start = 4, end = 10;
    song.loop(start, end);
    assert.equal(song.looping, true);
    assert.equal(song.loopStart, start);
    assert.equal(song.loopEnd, end);
  });


  it('should reset properly', () => {
    const start = 40, end = 50;
    song.position = 30;
    song.loop(start, end);
    assert.equal(song.looping, true);
    assert.equal(song.loopStart, start);
    assert.equal(song.loopEnd, end);
    song.reset();
    assert.equal(song.looping, false);
    assert.equal(song.loopStart, 0);
    assert.equal(song.loopEnd, 0);
    assert.equal(song.position, 0);
  });

  it('should seek correctly', () => {
    song.play();
    assert(song.isPlaying, 'song is not playing after calling play()');
    const pos = 30;
    song.seek(pos);
    assert(isWithinXMs(10, song.position, pos), `song did not seek to position correctly: ${print_ea(pos, song.position)}`);
  });

  // unit tests for the unit-test helper function below
  // not 'song' related, but I don't care
  it('should assert within X ms correctly', () => {
    assert.equal(isWithinXMs(5, 6, 7), false);
    assert.equal(isWithinXMs(5, 6, 6.002), true);
    assert.equal(isWithinXMs(1, 10, 11), false);
    assert.equal(isWithinXMs(1, 10, 10.0000000567), true);
  });

  function isWithinXMs(ms, actual, expected, message) {
    const dif = Math.abs(actual - expected);
    return dif < (ms / 1000);
  };

  it('should play and stop correctly', (done) => {
    song.play();
    setTimeout(() => {
      assert(song.isPlaying, 'song is not playing after calling play()');

      song.stop();
      assert(!song.isPlaying, 'song is playing after calling stop()');

      const expectedPos = source.stopTime - source.startTime;
      assert(isWithinXMs(20, song.position, expectedPos), `time difference was greater than 20 ms: ${print_ea(expectedPos, song.position)}`);
      done();
    }, 3000);
  });

  it('should play offsets correctly', (done) => {
    const offset = 4;
    song.play(offset);
    setTimeout(() => {
      assert(song.isPlaying, 'song is not playing after calling play()');

      song.stop();
      assert(!song.isPlaying, 'song is playing after calling stop()');

      const expectedPos = source.stopTime - source.startTime;
      assert(isWithinXMs(20, song.position, expectedPos + offset), `time difference was greater than 20 ms: ${print_ea(expectedPos + offset, song.position)}`);
      done();
    }, 3000);
  });

  it('should play loops properly', (done) => {
    song.loop(4, 10);
    song.play(9);
    setTimeout(() => {
      assert(song.isPlaying, 'song is not playing after calling play()');

      song.stop();
      assert(!song.isPlaying, 'song is playing after calling stop()');

      // start at 9, play for 3 seconds should go 9 => 10/4 => 5 => 6
      const expectedPos = 6;
      assert(isWithinXMs(20, song.position, expectedPos), `time difference was greater than 20 ms: ${print_ea(expectedPos, song.position)}`);
      done();
    }, 3000);
  });

  it('should stop automatically when it\'s over', (done) => {
    song.play(59);
    assert(song.isPlaying, 'song is not playing after calling play()');
    assert(isWithinXMs(5, song.position, 59), `time difference was greater than 5 ms: ${print_ea(59, song.position)}`);
    setTimeout(() => {
      assert(!song.isPlaying, 'song is playing after reaching the end');

      assert(isWithinXMs(5, song.position, 0), `time difference was greater than 5 ms: ${print_ea(0, song.position)}`);
      done();
    }, 3000);
  });

  /**
   * Prints the two values in the format `expected: <expected> actual: <actual>`
   */
  function print_ea(expected, actual) {
    return `expected: ${expected} actual: ${actual}\n`;
  }

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
