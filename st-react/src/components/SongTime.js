import React from 'react';
import {formatTime} from '../lib/util.js';

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

export default SongTime;