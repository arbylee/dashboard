import React, { Component } from 'react';
import './Tile.css';

class Tile extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.header}</h2>
        <div>{this.props.mainContent}</div>
        <div>{this.props.footer}</div>
      </div>
    )
  }
}

export default Tile;
