import React from 'react';
import './App.css';

class FileInput extends React.Component {
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
      <div className="FileInput">
        <p>
          Song Turtle helps you learn music by ear. You can select and loop any segment of a song and change its speed.
        </p>
        <br /><br />
        <input type="file" ref={this.fileInput} />
        <div className="drop-zone text-center pt-3 pb-3 shadow-sm" onClick={this.loadFile}>
          <span>Drop an audio file or click to upload</span>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  fileLoaded(event) {
    console.log('file loaded!')
  }

  loadFile(event) {
    console.log(event);
  }

  render() {
    return (
      <FileInput />
    );
  }
}

export default App;
