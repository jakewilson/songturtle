import React from 'react';

class Playback extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonValues: ['.5', '.75', '1'],
      selectedButtonIndex: 2
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(index) {
    this.props.onClick(this.state.buttonValues[index]);
    this.setState({
      selectedButtonIndex: index
    });
  }

  setCustomSpeed() {
    this.setState({
      selectedButtonIndex: 3
    });
  }

  render() {
    return (
      <form>
        <div className="form-row mt-2">
          <div className="col">
            <PlaybackButton val="0.5" index={0} isActive={this.state.selectedButtonIndex === 0} onClick={this.handleClick} text='.5x'/>
          </div>
          <div className="col">
            <PlaybackButton val="0.75" index={1} isActive={this.state.selectedButtonIndex === 1} onClick={this.handleClick} text='.75x'/>
          </div>
          <div className="col">
            <PlaybackButton val="1" index={2} isActive={this.state.selectedButtonIndex === 2} onClick={this.handleClick} text='1x'/>
          </div>
          <div className="col">
            <PlaybackButton index={3} isActive={this.state.selectedButtonIndex === 3} onClick={this.setCustomSpeed.bind(this)} text='Custom Speed'/>
          </div>
        </div>
      </form>
    );
  }
}

class PlaybackButton extends React.Component {
  handleClick = () => this.props.onClick(this.props.index);

  render() {
    if (this.props.isActive) {
      return (
        <button type="button" className="btn btn-warning btn-block playbackButton" value={this.props.val} onClick={this.handleClick}>{this.props.text}</button>
      );
    }

    return (
      <button type="button" className="btn btn-secondary btn-block playbackButton" value={this.props.val} onClick={this.handleClick}>{this.props.text}</button>
    );
  }
}

export default Playback;
