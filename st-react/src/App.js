import React from 'react';
import Song from './lib/song.js';
import {parseTime} from './lib/util.js';

import SongInput from './components/SongInput.js';
import SongInfo from './components/SongInfo.js';
import Playback from './components/Playback.js';
import Instructions from './components/Instructions.js';
import LoopInfo from './components/LoopInfo.js';

import './css/App.css';
import './css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioCtx: new AudioContext(),
      song: null,
      ignoreKeyStrokes: false,
      error: false
    }

    this.songLoadSuccess = this.songLoadSuccess.bind(this);
    this.songLoadError = this.songLoadError.bind(this);
    this.toggleSong = this.toggleSong.bind(this);
    this.ignoreKeyStrokes = this.ignoreKeyStrokes.bind(this);
    this.changeLoopSettings = this.changeLoopSettings.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  readFile(arrayBuffer) {
    this.state.audioCtx.decodeAudioData(arrayBuffer, this.songLoadSuccess, this.songLoadError);
  }

  songLoadSuccess(audioBuffer) {
    const song = new Song(this.state.audioCtx, audioBuffer);

    song.onStart(() => {
      this.forceUpdate();
    });

    song.onStop(() => {
      this.forceUpdate();
    })

    this.setState({
      song: song,
      error: false
    });
  }

  songLoadError() {
    this.setState({
      error: true
    })
  }

  fileSelected(event) {
    const files = event.nativeEvent.srcElement.files;
    if (files.length === 0)
      return;

    const reader = new FileReader();

    if (this.state.song) {
      this.state.song.stop();
    }

    reader.addEventListener('load', (e) => {
      this.readFile(e.target.result);
    });

    reader.readAsArrayBuffer(files[0]);
    this.setState({
      songName: files[0].name,
      song: null
    })
  }

  toggleSong() {
    const song = this.state.song;
    song.toggle();

    this.setState({
      song: song
    })
  }

  createLoop(start, end) {
    const song = this.state.song;
    song.loop(start, end);

    this.setState({
      song: song
    });
  }

  changeSongPlayback(value) {
    const song = this.state.song;
    song.changePlayback(value);
  }

  onCanvasClick(seconds) {
    const song = this.state.song;
    // if the song is looping, and the user clicks inside the loop,
    // seek to that position in the loop. If the user clicks outside the loop,
    // remove the loop and seek to that position
    if (song.looping && (seconds < song.loopStart || seconds > song.loopEnd)) {
      song.unloop();
    }

    song.seek(seconds);
    song.play();

    this.setState({
      song: song
    });
  }

  onKeyDown(event) {
    if (this.state.ignoreKeyStrokes)
      return;

    const song = this.state.song;

    if (!song)
      return;

    const key = event.key;
    switch (key) {
      case " ": {
        event.preventDefault();
        this.toggleSong();
        break;
      }

      case "l": case "L": {
        // TODO loop here
        break;
      }

      case "Escape": case "Backspace": {
        song.unloop();
        break;
      }

      case "ArrowLeft": {
        event.preventDefault();
        song.seek(song.position - 5);
        break;
      }

      case "ArrowRight": {
        event.preventDefault();
        song.seek(song.position + 5);
        break;
      }

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        song.seek((key / 10) * song.duration);
        break;
    }

    this.setState({
      song: song
    });
  }

  /**
   * Ignore all app keystrokes. Used if another component wants to use them and not get overridden
   */
  ignoreKeyStrokes() {
    this.setState({
      ignoreKeyStrokes: true
    });
  }

  /**
   * Change the loop settings (loopStart or loopEnd)
   * @param {string} type either 'start' or 'end'
   * @param {int} time the new parsed time
   * @return the newtime to the caller if accepted, -1 if invalid time or rejected for other reasons
   */
  changeLoopSettings(type, time) {
    const song = this.state.song;
    const newTime = parseTime(time);
    let ret = -1;

    if (newTime !== -1) {
      if (type === 'start') {
        if (newTime < song.loopEnd) {
          song.loopStart = newTime;
          ret = newTime;

          if (song.position < song.loopStart) {
            song.seek(song.loopStart);
          }
        }
      } else if (type === 'end') {
        if (newTime > song.loopStart && newTime < song.duration) {
          song.loopEnd = newTime;
          ret = newTime;
        }
      }
    }

    this.setState({
      song: song,
      ignoreKeyStrokes: false
    });

    return ret;
  }

  render() {
    const song = this.state.song;
    const col = <div className="col-sm-2"></div>;

    const songInput = (
      <div className="row mt-5">
        {col}
        <div className="col-md">
          <SongError error={this.state.error} />
          <SongInput onChange={this.fileSelected.bind(this)}/>
        </div>
        {col}
      </div>
    );

    if (!song) {
      return (
        <div className="container">
          {songInput}
        </div>
      );
    }

    return (
      <div className="container">
        {songInput}
        <div className="row mt-4">
          {col}
          <div className="col-md">
            <SongInfo
              song={song} name={this.state.songName}
              onCanvasClick={this.onCanvasClick.bind(this)}
              createLoop={this.createLoop.bind(this)}
            />
            <PlayButton onClick={this.toggleSong} playing={this.state.song.isPlaying} />
          </div>
          <div className="col-sm-2">
            {
              song.looping &&
              <LoopInfo
                start={song.loopStart} end={song.loopEnd}
                onFocus={this.ignoreKeyStrokes} onBlur={this.changeLoopSettings}
              />
            }
          </div>
        </div>
        <div className="row">
          {col}
          <div className="col-md">
            <Playback onClick={this.changeSongPlayback.bind(this)}/>
          </div>
          {col}
        </div>
        <div className="row mt-2">
          {col}
          <div className="col-md">
            <h3 className="text-center">Keys</h3>
            <hr />
            <Instructions />
          </div>
          {col}
        </div>
      </div>
    );
  }
}

function SongError(props) {
  if (props.error === false) {
    return null;
  }

  return (
    <div className="alert alert-danger" role="alert">
      Error loading song
    </div>
  );
}

function PlayButton(props) {
  let icon = <i className="fas fa-play-circle"></i>;
  if (props.playing) {
    icon = <i className="fas fa-pause-circle"></i>;
  }

  return (
    <button className="btn btn-primary btn-block" onClick={props.onClick}>
      {icon}
    </button>
  );
}

export default App;
