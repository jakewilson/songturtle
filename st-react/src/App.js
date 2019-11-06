import React from 'react';
import Song from './Song.js';
import Renderer from './renderer.js';
import {formatTime, getSelectionBar, getSelectionBarFromSeconds, getSecondsFromSelectionBar} from './util.js';
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

class SongTime extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTime: this.props.song.position
    };

    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.intervalID = setInterval(
      () => this.tick(),
      500
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  tick() {
    this.setState({
      currentTime: this.props.song.position
    });
  }

  render() {
    return (
      <span>{formatTime(this.props.mouseTime || this.state.currentTime)}/{formatTime(this.props.song.duration)}</span>
    );
  }
}

class SongInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      renderer: null,
      mouseTime: null // the time of the song being hovered over by the mouse
    };

    this.canvas = React.createRef();
    this.onCanvasClick = this.onCanvasClick.bind(this);
    this.onCanvasMouseMove = this.onCanvasMouseMove.bind(this);
    this.onCanvasMouseLeave = this.onCanvasMouseLeave.bind(this);
  }

  componentDidMount() {
    const renderer = new Renderer(this.canvas.current, this.props.song);
    renderer.drawWaveform();
    this.setState({
      renderer: renderer
    });
  }

  onCanvasClick(event) {
    // TODO
    this.props.song.play();
  }

  onCanvasMouseMove(event) {
    this.state.renderer.selectionBar = getSelectionBar(event.nativeEvent, this.props.song, this.canvas.current);
    this.setState((state, props) => ({
      mouseTime: getSecondsFromSelectionBar(props.song, state.renderer.selectionBar)
    }));
  }

  onCanvasMouseLeave(event) {
    this.state.renderer.selectionBar = null;
    this.setState({
      mouseTime: null // TODO may need to set this to the song time
    });
  }

  render() {
    if (!this.props.song) {
      return null;
    }

    return (
      <div>
        <span><strong>{this.props.name}</strong></span>
        <hr />
        <SongTime mouseTime={this.state.mouseTime} song={this.props.song} />
        <br />
        <canvas
          className="w-100 h-25 SongCanvas" width="600" ref={this.canvas}
          onClick={this.onCanvasClick}
          onMouseMove={this.onCanvasMouseMove}
          onMouseLeave={this.onCanvasMouseLeave}
        ></canvas>
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
            {
              song && <SongInfo song={song} name={this.state.songName}/>
            }
          </div>
          <div className="col-sm-2"></div>
        </div>
      </div>
    );
  }
}

export default App;
