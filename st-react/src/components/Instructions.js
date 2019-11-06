import React from 'react';

function Instructions(props) {
  const col = <div className="col"></div>;
  return (
    <form>
      <div className="form-row">
        <div className="col text-right">
          <Key value="L" className="pr-2 pl-2"/>
        </div>
        <div className="col text-left">
          <span>start/end loop</span>
        </div>
        {col}{col}
        <div className="col text-right">
          <Key value="spacebar" />
        </div>
        <div className="col text-right">
          <span>play/pause</span>
        </div>
      </div>
      <div className="form-row mt-3">
        <div className="col text-right">
          <Key value="backspace" />
        </div>
        <div className="col text-left">
          <span>remove loop</span>
        </div>
        {col}{col}
        <div className="col text-right">
          <Key value="&#8592;&#8594;"/>
        </div>
        <div className="col text-right">
          <span>seek +/- 5 seconds</span>
        </div>
      </div>
    </form>
  );
}

function Key(props) {
  return (
    <span className="Key">{props.value}</span>
  );
}

export default Instructions;