import React, { Component } from 'react';
import Tile from './Tile.js';
import axios from 'axios';

class BoaBalance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: '',
      date: '',
    };
  }

  componentDidMount() {
    console.log("mount");
    var _this = this;
    this.serverRequest = axios.get('/boa-balance')
      .then(function(response) {
        console.log(response);
        _this.setState({
          balance: response.data.balance,
          date: response.data.date,
        });
      })
  }

  render() {
    return (
      <div className="boa-balance">
        <Tile main={this.state.balance} />
      </div>
    );
  }
}

export default BoaBalance;

