import React from 'react';
import Song from './Song.js';
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
      song: new Song(state.audioCtx, audioBuffer, null)
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
  }

  render() {
    return (
      <div className="container">
        <div class="row mt-5">
          <div class="col-sm-2"></div>
          <div class="col-md">
            <SongInput onChange={this.fileSelected.bind(this)}/>
          </div>
          <div class="col-sm-2"></div>
        </div>
      </div>
    );
  }
}

export default App;
