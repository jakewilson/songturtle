import React from 'react';

function Instructions(props) {
  const col = <div className="col"></div>;
  return (
    <form>
      <div className="form-row">
        <Key value="L" />
        <div className="col text-left">
          <span>start/end loop</span>
        </div>
        {col}{col}
        <Key value="spacebar" />
        <div className="col text-right">
          <span>play/pause</span>
        </div>
      </div>
      <div className="form-row mt-3">
        <Key value="backspace" />
        <div className="col text-left">
          <span>remove loop</span>
        </div>
        {col}{col}
        <Key value="&#8592;&#8594;"/>
        <div className="col text-right">
          <span>seek +/- 5 seconds</span>
        </div>
      </div>
    </form>
  );
}

function Key(props) {
  return (
    <div className="col text-right">
      <span className="Key">{props.value}</span>
    </div>
  );
}

export default Instructions;