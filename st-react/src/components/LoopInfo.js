import React from 'react';
import {formatTime} from '../lib/util.js';

class LoopInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      start: formatTime(this.props.start),
      end: formatTime(this.props.end),
      originalTime: null
    }

    this.start = React.createRef();
    this.end = React.createRef();

    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  componentDidMount() {
    let blurComponent = (event, ref) => {
      const key = event.key;
      if (key === "Enter") {
        ref.blur();
      }
    };

    this.start.current.addEventListener('keydown', (e) => blurComponent(e, this.start.current));
    this.end.current.addEventListener('keydown', (e) => blurComponent(e, this.end.current));
  }

  onBlur(event) {
    const name = event.target.name;
    const value = event.target.value;

    const newTime = this.props.onBlur(name, value);
    let newValue = this.state.originalTime;

    if (newTime !== -1) {
      newValue = formatTime(newTime);
    }

    this.setState({
      originalTime: null,
      [name]: newValue
    });
  }

  onFocus(event) {
    const value = event.target.value;

    this.setState({
      originalTime: value
    });

    this.props.onFocus();
  }

  onChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div>
        <span>Loop</span>
        <hr />
        Start:  <input
                  type="text" className="text-right" value={this.state.start}
                  onFocus={this.onFocus} onBlur={this.onBlur}
                  ref={this.start} onChange={this.onChange} name="start"
                />
        <br />
        End:  <input
                type="text" className="text-right" value={this.state.end}
                onFocus={this.onFocus} onBlur={this.onBlur}
                ref={this.end} onChange={this.onChange} name="end"
              />
      </div>
    );
  }
}

export default LoopInfo;