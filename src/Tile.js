import React, { Component } from 'react';
import './Tile.css';

class Tile extends Component {
  render() {
    var data;
    return (
      <div>{this.props.main}</div>
    )
  }
}

export default Tile;
