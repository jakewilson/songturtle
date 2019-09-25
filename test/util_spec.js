
describe('Test', function() {
  it('should format time correctly1', function() {
    var seconds = 120;
    assert.equal('2:00', formatTime(seconds));
  });
  it('should format time correctly2', function() {
    var seconds = 3;
    assert.equal('0:03', formatTime(seconds));
  });
  it('should format time correctly3', function() {
    var seconds = 1000;
    assert.equal('16:40', formatTime(seconds));
  });
  it('should format time correctly4', function() {
    var seconds = 541;
    assert.equal('9:01', formatTime(seconds));
  });
  it('should format time correctly5', function() {
    var seconds = 3601;
    assert.equal('60:01', formatTime(seconds));
  });
  it('should pad seconds correctly1', function() {
    var seconds = 1;
    assert.equal(padSeconds(seconds), '01');
  });
  it('should pad seconds correctly1', function() {
    var seconds = 11;
    assert.equal(padSeconds(seconds), '11');
  });
});
