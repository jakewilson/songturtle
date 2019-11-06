import React from 'react';
import Song from './lib/song.js';
import SongInput from './components/SongInput.js';
import SongInfo from './components/SongInfo.js';

import './css/App.css';
import './css/bootstrap.min.css';

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
