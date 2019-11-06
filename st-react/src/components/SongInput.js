import React from 'react';

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

export default SongInput;