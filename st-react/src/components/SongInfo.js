import React from 'react';
import Renderer from '../lib/renderer.js';
import SongTime from './SongTime.js';
import {getSelectionBar, getSecondsFromSelectionBar} from '../lib/util.js';

class SongInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      renderer: null,
      mouseTime: null, // the time of the song being hovered over by the mouse
      mouseDrag: false,
      mouseDownTime: null
    };

    /** the amount of time under which constitutes a click, over which a 'hold' */
    this.CLICK_TIME_MS = 300;

    this.canvas = React.createRef();
    this.onCanvasMouseMove = this.onCanvasMouseMove.bind(this);
    this.onCanvasMouseDown = this.onCanvasMouseDown.bind(this);
    this.onCanvasMouseUp = this.onCanvasMouseUp.bind(this);
    this.onCanvasMouseLeave = this.onCanvasMouseLeave.bind(this);
    this.mouseDrag = this.mouseDrag.bind(this);
  }

  componentDidMount() {
    const renderer = new Renderer(this.canvas.current, this.props.song);
    renderer.drawWaveform();

    this.setState({
      renderer: renderer
    });
  }

  onCanvasMouseMove(event) {
    const renderer = this.state.renderer;
    const selection = getSelectionBar(event.nativeEvent, this.props.song, this.canvas.current);

    if (this.mouseDrag()) {
      renderer.selectionStart = this.state.selectionStart;
      renderer.selectionEnd = selection;
      renderer.selectionBar = null;
    } else {
      renderer.selectionBar = selection;
    }

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

  onCanvasMouseDown(event) {
    this.setState({
      mouseDownTime: Date.now(),
      selectionStart: getSelectionBar(event.nativeEvent, this.props.song, this.canvas.current)
    });
  }

  onCanvasMouseUp(event) {
    const renderer = this.state.renderer;
    const song = this.props.song;

    let selection = getSelectionBar(event.nativeEvent, this.props.song, this.canvas.current);
    if (this.mouseDrag()) {
      // if the user dragged the mouse to the left, we will switch
      // the start and end positions
      const start = Math.min(this.state.selectionStart, selection);
      const end   = Math.max(this.state.selectionStart, selection);
      this.props.createLoop(getSecondsFromSelectionBar(song, start), getSecondsFromSelectionBar(song, end));

      renderer.selectionStart = null;
      renderer.selectionEnd = null;
    } else {
      // convert the selection bar into actual seconds, then jump to that time
      const offset = getSecondsFromSelectionBar(song, selection);

      this.props.onCanvasClick(offset);
    }

    this.setState({
      renderer: renderer,
      selectionStart: null,
      mouseDownTime: null
    });
  }

  /**
   * @return true if the mouse is dragging, false otherwise
   */
  mouseDrag() {
    if (this.state.mouseDownTime === null)
      return false;

    return (Date.now() - this.state.mouseDownTime > this.CLICK_TIME_MS);
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
          onMouseDown={this.onCanvasMouseDown}
          onMouseUp={this.onCanvasMouseUp}
          onMouseMove={this.onCanvasMouseMove}
          onMouseLeave={this.onCanvasMouseLeave}
        ></canvas>
      </div>
    );
  }
}

export default SongInfo;