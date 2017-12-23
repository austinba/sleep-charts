// import moment from 'moment';
// import exampleData from '../example_data/example-1.json';


const moment = require('moment');
const data = require('../example_data/example-1.json');

const { intialSleepiness, wakeConstant, sleepConstant } = data.params;
const sleepHistory = data.sleepHistory.map( ({date, duration, sleep, wake}) => {
  const record = {
    date: moment(date, 'M/D/YY'),
    duration: moment.duration(duration),
    sleep: moment.duration(sleep, 'h:mm'),
    wake: moment.duration(wake, 'h:mm')
  };

  const wakeTime = moment(record.date).add(record.wake);
  let sleepTime = moment(record.date).add(record.sleep);

  // make sure sleep is before wake by at least the duration of the sleep
  while(wakeTime.diff(sleepTime) < record.duration._milliseconds) {
    sleepTime = sleepTime.subtract(1, 'days');
  }

  return {
    wake: wakeTime,
    sleep: sleepTime,
    duration: record.duration._milliseconds,
    efficiency: record.duration/wakeTime.diff(sleepTime)
  }

});

console.log(sleepHistory[0]);
