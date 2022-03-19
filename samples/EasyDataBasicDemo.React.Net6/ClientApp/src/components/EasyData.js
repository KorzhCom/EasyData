import React, { Component } from 'react';
import { EasyDataViewDispatcher } from '@easydata/crud';

export class EasyData extends Component {

  static displayName = EasyData.name;

  componentDidMount() {
    this.viewDispatcher = new EasyDataViewDispatcher();
    this.viewDispatcher.run();
  }

  render() {
    return (
      <div id="EasyDataContainer"></div>
    );
  }

  componentWillUnmount() {
    if (this.viewDispatcher)
        this.viewDispatcher.detach();
  }
}
