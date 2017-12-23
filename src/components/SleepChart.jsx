import React from 'react';
import {Scatter} from 'react-chartjs-2';
import computeSleepinessHistory from '../util/computeSleepinessHistory';

const sleepinessLineFormat = {
  label: 'My First dataset',
  fill: false,
  backgroundColor: 'rgba(75,192,192,0.4)',
  showLine: true,
  lineTension: 0.1,
  borderColor: 'rgba(75,192,192,1)',
  borderWidth: 4,
  pointBorderColor: 'rgba(75,192,192,1)',
  pointBackgroundColor: '#fff',
  pointBorderWidth: 4,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10
};
// const data = {
//   labels: ['Scatter'],
//   datasets: [
//     {
//       label: 'My First dataset',
//       fill: false,
//       backgroundColor: 'rgba(75,192,192,0.4)',
//       showLine: true,
//       lineTension: 0.1,
//       borderColor: 'rgba(75,192,192,1)',
//       borderWidth: 4,
//       pointBorderColor: 'rgba(75,192,192,1)',
//       pointBackgroundColor: '#fff',
//       pointBorderWidth: 4,
//       pointHoverRadius: 5,
//       pointHoverBackgroundColor: 'rgba(75,192,192,1)',
//       pointHoverBorderColor: 'rgba(220,220,220,1)',
//       pointHoverBorderWidth: 2,
//       pointRadius: 1,
//       pointHitRadius: 10,
//       data: [
//         { x: 65, y: 75 },
//         { x: 59, y: 49 },
//         { x: 80, y: 90 },
//         { x: 81, y: 29 },
//         { x: 56, y: 36 },
//         { x: 55, y: 25 },
//         { x: 40, y: 18 },
//       ]
//     }
//   ]
// };
export default class SleepChart extends React.Component {
  render() {
    const {sleepHistory, params} = this.props.userData;
    const {initialSleepiness, wakeConstant, sleepConstant} = params;
    const sleepiness = computeSleepinessHistory(sleepHistory, initialSleepiness, wakeConstant, sleepConstant)
      .map( record => ({x: record.time, y: record.sleepiness}));

    const data = {
      labels: ['Sleepiness'],
      datasets: [
        {
          ...sleepinessLineFormat,
          data: sleepiness
        }
      ]
    }
    return <Scatter data={data} />;
  }
}
