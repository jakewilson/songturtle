(function() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext);
  const canvas = document.querySelector('canvas');
  const playbackDiv = document.getElementById('playback-div');

  var song = null, renderer = null;
  var drawInterval = null, clockInterval = null;

  function onMp3Load(e) {
    audioCtx.decodeAudioData(e.target.result, songInit, songInitError);
  }

  function songInit(audioBuffer) {
    // hide the loading div and show the canvas
    hideElement('loadingDiv');
    showElement(canvas);
    showElement(playbackDiv);

    song = new Song(audioCtx, audioBuffer, canvas);
    song.onStart(toggleButton);
    song.onStop(toggleButton);

    renderer = new Renderer(canvas, song);
    renderer.drawWaveform();

    var timeSpan = document.getElementById('timeSpan');
    timeSpan.innerHTML = `0:00/${formatTime(song.duration)}`;
    showElement(timeSpan);
  }

  function songInitError(error) {
    hideElement('loadingDiv');
    const errorDiv = document.getElementById('errorDiv');
    showElement(errorDiv);
    errorDiv.innerHTML = 'Error decoding song';
    console.log('error decoding song');
  }

  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', getFile);

  /**
   * Loads the file selected by the user. If it is not an mp3, show an error and don't
   * load the file.
   */
  function getFile() {
    const files = this.files;
    if (files.length === 0)
      return;

    // make sure we don't play more than one song at the same time
    if (song) {
      song.stop();
      song = null;
    }

    // if multiple mp3s are selected, pick the first one
    const file = files[0];
    const reader = new FileReader();

    // show the loading div and hide the canvas
    showElement('loadingDiv');
    hideElement(canvas);
    hideElement('timeSpan');

    reader.addEventListener('load', onMp3Load);

    // show an error if the file is not an mp3
    const errorDiv = document.getElementById('errorDiv');
    if (file.name.match(/\.mp3$/) == null) {
      showElement(errorDiv);
      errorDiv.innerHTML = file.name + ' is not an mp3 file.';
      hideElement('loadingDiv');
      return;
    } else {
      hideElement(errorDiv);
    }

    reader.readAsArrayBuffer(file);
    console.log(file.name);
  }


  const playButton = document.querySelector('button');
  playButton.addEventListener('click', toggleSong);

  function toggleSong() {
    // don't bother doing anything if we don't have a song picked yet
    if (song == null)
      return;

    if (!song.isPlaying) {
      song.play();
    } else {
      song.stop();
    }
  }

  /**
   * Toggles the play button based on if the song is playing or not
   * This will be called automatically by song, no need to manually call it
   * Call toggleSong() instead
   */
  function toggleButton() {
    if (!song)
      return;

    if (song.isPlaying) {
      playButton.innerHTML = "<span>Pause</span>";
      drawInterval = setInterval(renderer.drawWaveform, 40, renderer);
      clockInterval = setInterval(updateClock, 200, song);
    } else {
      playButton.innerHTML = "<span>Play</span>";
      clearInterval(drawInterval);
      clearInterval(clockInterval);
    }
  }

  /*
   * The number of seconds elapsed to show on the track clock. This will
   * normally be the seconds elapsed in the song, but will change if the
   * user is hovering the mouse over the track to show the time of the
   * mouse position
   */
  var clockSeconds = null;

  /**
   * Updates the clock above the music player. Should be called
   * on an interval while the song is playing. Can also be called
   * if a function needs to update the clock immediately and can't
   * wait for the interval
   *
   * @param song the song
   */
  function updateClock(song) {
    var seconds = clockSeconds;
    if (seconds === null) {
      seconds = song.position;
    }

    seconds = formatTime(seconds);

    var clock = document.getElementById('timeSpan');
    clock.innerHTML = seconds + "/" + formatTime(song.duration);
  }

  /** the amount of time under which constitutes a click, over which a 'hold' */
  const CLICK_TIME_MS = 300;

  canvas.addEventListener('mousemove', function(e) {
    if (!song)
      return;

    var selectionBar = getSelectionBar(e);
    if (song.isPlaying && renderer !== null) {
      renderer.selectionBar = selectionBar;
      clockSeconds = getSecondsFromSelectionBar(renderer.selectionBar);
      updateClock(song);
    }

    // if the time the user has had the mouse down is greater than the
    // 'click' time, the user is dragging the mouse
    if (mouseIsDown && Date.now() - mouseDownTime > CLICK_TIME_MS) {
      // turn off the selection if the user is selecting a loop
      renderer.selectionBar = null;
      renderer.selectionStart = tempLoopStart;
      renderer.selectionEnd = selectionBar;

      // allow the user to draw a loop if the song isn't playing
      // we check to make sure it's not playing, because if it is then
      // it will be drawn automatically
      if (!song.isPlaying) {
        renderer.drawWaveform(renderer);
      }
    }
  });

  canvas.addEventListener('mouseleave', function(e) {
    if (!song)
      return;

    if (renderer)
      renderer.selectionBar = null;

    clockSeconds = null;
    updateClock(song);
  });

  var mouseDownTime = null;
  var mouseIsDown = false;
  var tempLoopStart = null;

  canvas.addEventListener('mousedown', function(e) {
    if (!song)
      return;

    mouseIsDown = true;
    mouseDownTime = Date.now();

    // this variable is 'temporary' because we don't yet know if the user is
    // intending to click or to drag. If it's a click, we don't want
    // to change to loop, but if it's a drag we do. So we will wait
    tempLoopStart = getSelectionBar(e);
  });

  canvas.addEventListener('mouseup', function(e) {
    if (!song)
      return;

    mouseIsDown = false;
    if (Date.now() - mouseDownTime <= CLICK_TIME_MS) {
      // the user clicked
      if (!song.isPlaying) {
        song.play();
        return;
      }

      var selection = getSelectionBar(e);
      // convert the selection bar into actual seconds, then jump to that time
      var offset = getSecondsFromSelectionBar(selection);

      // if the song is looping, and the user clicks inside the loop,
      // seek to that position in the loop. If the user clicks outside the loop,
      // remove the loop and seek to that position
      if (song.looping && (offset < song.loopStart || offset > song.loopEnd)) {
        song.unloop();
        renderer.loopStart = null;
        renderer.loopEnd = null;
      }

      song.seek(offset);
      updateClock(song);
    } else { // the user dragged the mouse
      // if the user dragged the mouse to the left, we will switch
      // the start and end positions
      const start = Math.min(renderer.selectionStart, renderer.selectionEnd);
      const end   = Math.max(renderer.selectionStart, renderer.selectionEnd);

      renderer.selectionStart = null; renderer.selectionEnd = null;

      renderer.loopStart = start;
      renderer.loopEnd   = end;

      song.stop();

      const loopStartSeconds = Math.floor(getSecondsFromSelectionBar(start));
      const loopEndSeconds = Math.floor(getSecondsFromSelectionBar(end));

      song.loop(loopStartSeconds, loopEndSeconds);
      song.play(song.loopStart);
    }
  });

  /**
   * Given a canvas selectionBar, return the number of
   * seconds it corresponds to in the song
   *
   * @param selectionBar the selectionBar
   * @return the time in seconds of the song
   */
  function getSecondsFromSelectionBar(selectionBar) {
    return selectionBar * (song.duration / song.waveform.length);
  }

  /**
   * Returns the "bar" number on the track that the mouse is selecting
   *
   * @param e the event to get the mouse data from
   * @return a number between 0 and [waveform.length] specifying which bar is selected
   */
  function getSelectionBar(e) {
    return Math.floor(mousePosToCanvasPos(e.clientX, e.clientY, canvas).x * (song.waveform.length / canvas.width));
  }

  /**
   * Converts mouse "page" coordinates to canvas coordinates
   *
   * @return an object with two attributes, x and y, of the canvas coordinates
   */
  function mousePosToCanvasPos(mouseX, mouseY, canvas) {
    // the "bounding rectangle" of the canvas - this contains
    // the canvas coordinates relative to the page
    const boundingRect = canvas.getClientRects()[0];

    // this will give us the mouse position relative to the canvas in page
    // coordinates
    mouseX -= boundingRect.x;
    mouseY -= boundingRect.y;

    // now convert the page coordinates to canvas coordinates - where in the viewport
    // the mouse was clicked
    return {
      x: mouseX * (canvas.width / boundingRect.width),
      y: mouseY * (canvas.height / boundingRect.height)
    };
  }

  const playbackSpan = document.getElementById('playback-span');
  const playbackInp = document.getElementById('playback');

  playbackInp.addEventListener('input', function(e) {
    playbackSpan.innerHTML = 'Playback: ' + playbackInp.value;
  });

  playbackInp.addEventListener('change', function(e) {
    if (!song)
      return;

    song.changePlayback(playbackInp.value);
  });

  // key commands
  document.querySelector('body').onkeydown = function(e) {
    if (!song)
      return;

    switch (e.key) {
      case " ": {
        e.preventDefault();
        toggleSong();
        break;
      }

      case "Backspace": {
        e.preventDefault();
        if (song.looping) {
          song.unloop();
          if (renderer)
            renderer.drawWaveform(renderer);
        }
        break;
      }

      case "ArrowLeft": {
        e.preventDefault();
        if (song.looping) {
          song.seek(song.loopStart);
        } else {
          song.seek(0);
        }
        break;
      }
    }
  };
})();
