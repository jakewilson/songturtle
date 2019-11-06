import React from 'react';
import Renderer from '../lib/renderer.js';
import SongTime from './SongTime.js';
import {getSelectionBar, getSelectionBarFromSeconds, getSecondsFromSelectionBar} from '../lib/util.js';

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
    const renderer = this.state.renderer;
    renderer.selectionBar = getSelectionBar(event.nativeEvent, this.props.song, this.canvas.current);
    this.setState((state, props) => ({
      renderer: renderer,
      mouseTime: getSecondsFromSelectionBar(props.song, state.renderer.selectionBar)
    }));
  }

  onCanvasMouseLeave(event) {
    const renderer = this.state.renderer;
    renderer.selectionBar = null;
    this.setState({
      renderer: renderer,
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

export default SongInfo;