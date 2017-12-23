import moment from 'moment';

// // testing
// const moment = require('moment');
// const exampleData = require('../../example_data/example-1.json');


function skewedSine(skew, hour, cycleTrough, cycleAmplitude) {
  const computedHour = hour - cycleTrough;

  return Math.sin(
    (computedHour*2*Math.PI/24) +
    (skew*Math.sin(computedHour*2*Math.PI/24))
  ) / 2 * cycleAmplitude;
};

export default function computeSleepCycles(history, skew, cycleTrough_unprocessed, cycleAmplitude, sleepMean, wakeMean) {
  const cycleTrough = moment(cycleTrough_unprocessed, 'h:mm').hour();
  const startDate = moment(history[0].date, 'M/D/YYYY').startOf('day');
  const endDate = moment(history[history.length-1].date, 'M/D/YYYY').add(1, 'days').startOf('day');
  const hours = endDate.diff(startDate, 'hours');
  const cycle = Array();
  for(const i = moment(startDate); endDate.diff(i) > 0; i.add(1, 'hours')) {
    let record = skewedSine(skew, i.hour(), cycleTrough, cycleAmplitude);
    cycle.push({
      time: moment(i),
      sleepLine: record + sleepMean,
      wakeLine: record + wakeMean
    });
  }
  return cycle;
};

// // testing
// const result = computeCycleDataSets(
//   exampleData.sleepHistory,
//   exampleData.params.cycleSkew,
//   exampleData.params.cycleTrough,
//   exampleData.params.cycleAmplitude,
//   exampleData.params.sleepMean,
//   exampleData.params.wakeMean
// );
// console.log(result);
