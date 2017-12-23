import React from 'react';
import SleepChart from './SleepChart';

const userData = require('../../example_data/example-1.json');

export default class App extends React.Component {
  render() {
    return <div>
      <SleepChart userData={userData} />
    </div>;
  }
}
