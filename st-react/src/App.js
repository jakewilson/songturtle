import React from 'react';
import Song from './Song.js';
import {formatTime} from './util.js';
import './App.css';
import './bootstrap.min.css';

class SongInput extends React.Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.loadFile = this.loadFile.bind(this);
  }

  loadFile() {
    this.fileInput.current.click();
  }

  render() {
    return (
      <div className="SongInput">
        <span>
          Song Turtle helps you learn music by ear. You can select and loop any segment of a song and change its speed.
        </span>
        <br /><br />
        <input type="file" ref={this.fileInput} onChange={this.props.onChange} />
        <div className="drop-zone text-center pt-3 pb-3 shadow-sm" onClick={this.loadFile}>
          <span>Drop an audio file or click to upload</span>
        </div>
      </div>
    );
  }
}

class Waveform extends React.Component {
  constructor(props) {
    super(props);

    this.canvas = React.createRef();
  }

  render() {
    return (
      <canvas class="w-100 h-25" width="600" ref={this.canvas}></canvas>
    );
  }
}

function Time(props) {
  return (
    <span>{formatTime(props.currentTime)}/{formatTime(props.totalTime)}</span>
  );
}

class SongInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.song) {
      return null;
    }

    return (
      <div>
        <span><strong>{this.props.name}</strong></span>
        <hr />
        <Time currentTime={this.props.song.position} totalTime={this.props.song.duration} />
        <br />
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioCtx: new AudioContext(),
      song: null
    }

    this.songInit = this.songInit.bind(this);
  }

  readFile(arrayBuffer) {
    this.state.audioCtx.decodeAudioData(arrayBuffer, this.songInit, this.songError);
  }

  songInit(audioBuffer) {
    this.setState((state) => ({
      song: new Song(state.audioCtx, audioBuffer)
    }));
  }

  songError() {
    console.log('error!');
    // TODO
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

  render() {
    const song = this.state.song;

    return (
      <div className="container">
        <div className="row mt-5">
          <div className="col-sm-2"></div>
          <div className="col-md">
            <SongInput onChange={this.fileSelected.bind(this)}/>
          </div>
          <div className="col-sm-2"></div>
        </div>
        <div className="row mt-4">
          <div className="col-sm-2"></div>
          <div className="col-md">
            <SongInfo song={song} name={this.state.songName}/>
          </div>
          <div className="col-sm-2"></div>
        </div>
      </div>
    );
  }
}

export default App;
