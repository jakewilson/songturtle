import React from 'react';
import Song from './lib/song.js';
import SongInput from './components/SongInput.js';
import SongInfo from './components/SongInfo.js';
import Playback from './components/Playback.js';
import Instructions from './components/Instructions.js';

import './css/App.css';
import './css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioCtx: new AudioContext(),
      song: null,
      error: false
    }

    this.songLoadSuccess = this.songLoadSuccess.bind(this);
    this.songLoadError = this.songLoadError.bind(this);
    this.toggleSong = this.toggleSong.bind(this);
  }

  readFile(arrayBuffer) {
    this.state.audioCtx.decodeAudioData(arrayBuffer, this.songLoadSuccess, this.songLoadError);
  }

  songLoadSuccess(audioBuffer) {
    this.setState((state) => ({
      song: new Song(state.audioCtx, audioBuffer),
      error: false
    }));
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

    reader.addEventListener('load', (e) => {
      this.readFile(e.target.result);
    });

    reader.readAsArrayBuffer(files[0]);
    this.setState({
      songName: files[0].name
    })
  }

  toggleSong() {
    this.state.song.toggle();
    this.forceUpdate();
  }

  changeSongPlayback(value) {
    const song = this.state.song;
    song.changePlayback(value);
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
            <SongInfo song={song} name={this.state.songName}/>
            <PlayButton onClick={this.toggleSong} playing={this.state.song.isPlaying} />
          </div>
          {col}
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
