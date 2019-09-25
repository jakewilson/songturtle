(function() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext);
  const canvas = document.querySelector('canvas');

  var song = null, renderer = null;
  var drawInterval = null, clockInterval = null;

  function onMp3Load(e) {
    audioCtx.decodeAudioData(e.target.result, songInit, songInitError);
  }

  function songInit(audioBuffer) {
    // hide the loading div and show the canvas
    hideElement('loadingDiv');
    showElement(canvas);

    song = new Song(audioCtx, audioBuffer, canvas);
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
      stopSong();
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
  playButton.addEventListener('click', function() {
      // don't bother doing anything if we don't have a song picked yet
      if (song == null)
        return;

      if (!song.isPlaying) {
        playSong();
      } else {
        stopSong();
      }
  });

  /**
   * Plays the song, changes DOM elements, and starts some intervals
   */
  function playSong() {
    if (song === null || renderer === null) {
      console.log('tried to play the song but it or the renderer was null');
      return;
    }

    playButton.innerHTML = "<span>Pause</span>";
    song.play();
    drawInterval = setInterval(renderer.drawWaveform, 40, renderer);
    clockInterval = setInterval(updateClock, 500, song);
  }

  /**
   * Stops the song, changes DOM elements, and clears some intervals
   */
  function stopSong() {
    if (song === null) {
      console.log('tried to stop the song but it was null');
      return;
    }

    playButton.innerHTML = "<span>Play</span>";
    song.stop();
    clearInterval(drawInterval);
    clearInterval(clockInterval);
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
      seconds = song.timePlayed / 1000;
    }

    seconds = formatTime(seconds);

    var clock = document.getElementById('timeSpan');
    clock.innerHTML = seconds + "/" + formatTime(song.duration);
  }

  canvas.addEventListener('mousemove', function(e) {
    if (song.isPlaying && renderer !== null) {
      renderer.selectionBar = getSelectionBar(e);
      clockSeconds = getSecondsFromSelectionBar(renderer.selectionBar);
      updateClock(song);
      // if the time the user has had the mouse down is greater than the
      // 'click' time, the user is dragging the mouse
      if (mouseIsDown && Date.now() - mouseDownTime > CLICK_TIME_MS) {
        loopEnd = renderer.selectionBar;
        console.log(`selecting ${loopStart} to ${loopEnd}`);
      }
    }
  });

  canvas.addEventListener('mouseleave', function(e) {
    renderer.selectionBar = null;
    clockSeconds = null;
    updateClock(song);
  });

  var mouseDownTime = null;
  var mouseIsDown = false;
  // the starting point for the user-selected loop in "selection bar" coordinates
  var loopStart = null, loopEnd = null;
  canvas.addEventListener('mousedown', function(e) {
    mouseIsDown = true;
    mouseDownTime = Date.now();
    loopStart = getSelectionBar(e);
  });

  const CLICK_TIME_MS = 300;

  canvas.addEventListener('mouseup', function(e) {
    mouseIsDown = false;
    if (Date.now() - mouseDownTime <= CLICK_TIME_MS) {
      // the user clicked
      if (!song.isPlaying) {
        playSong();
        return;
      }

      var selection = getSelectionBar(e);
      // convert the selection bar into actual seconds, then jump to that time
      var offset = getSecondsFromSelectionBar(selection);
      song.stop();
      song.play(offset);
      updateClock(song);
    } else { // the user dragged the mouse
      console.log(`selection was ${loopStart} - ${loopEnd}`);
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
})();
