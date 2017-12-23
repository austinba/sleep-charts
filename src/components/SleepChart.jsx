import React from 'react';
import {Scatter} from 'react-chartjs-2';
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
    }
    return <div style={{width: 4000}}>
      <Scatter data={data} width={2500}/>
    </div>;
  }
}
