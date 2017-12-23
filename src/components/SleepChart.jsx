import React from 'react';
import {Scatter} from 'react-chartjs-2';
import moment from 'moment';
import computeSleepinessHistory from '../util/computeSleepinessHistory';
import computeSleepCycles from '../util/computeSleepCycles';
import {sleepinessLineFormat, cycleLineFormat} from '../formatting/sleepChartFormats';

export default class SleepChart extends React.Component {
  render() {
    const { sleepHistory, params } = this.props.userData;
    const { initialSleepiness, wakeConstant, sleepConstant,
            cycleAmplitude, cycleTrough, cycleSkew, wakeMean, sleepMean
          } = params;
    const sleepiness = computeSleepinessHistory(sleepHistory, initialSleepiness, wakeConstant, sleepConstant);
    const cycle = computeSleepCycles(sleepHistory, cycleSkew, cycleTrough, cycleAmplitude, sleepMean, wakeMean);
    const startDate = moment(sleepHistory[0].date, 'M/D/YYYY').startOf('day');
    const endDate = moment(sleepHistory[sleepHistory.length-1].date, 'M/D/YYYY').add(1, 'days').startOf('day');

    const data = {
      labels: ['Sleepiness', 'Wake Cycle', 'Sleep Cycle'],
      datasets: [
        {
          label: 'Sleepiness',
          ...sleepinessLineFormat,
          data: sleepiness.map( record => ({x: record.time, y: record.sleepiness}))
        },{
          label: 'Wake Cycle',
          ...cycleLineFormat,
          data: cycle.map( record => ({x: record.time, y: record.wakeLine})),
          fill: 'start'
        },{
          label: 'Sleep Cycle',
          ...cycleLineFormat,
          data: cycle.map( record => ({x: record.time, y: record.sleepLine})),
          fill: 'end'
        }
      ]
    };
    const options = {
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          type: 'time',
          distribution: 'linear',
          time: {
            unit: 'hour',
            stepSize: 1,
            min: startDate,
            max: endDate,
            displayFormats: {
              hour: 'MM/DD/YYYY h:mm:ss a'
            }
          },
          ticks: {
            callback: (value, index) => {
              const date = moment(value);
              if(date.hour() === 0) {
                return date.format('ddd MM/DD')
              } else if (date.hour() % 3 === 0){
                return date.format('h a')
              } else {
                return null;
              }

            }
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 1
          }
        }]
      }
    };
    return <div style={{width: 4000}}>
      <Scatter data={data} options={options} width={3500} height={230} />
    </div>;
  }
}
