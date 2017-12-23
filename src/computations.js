// import moment from 'moment';
// import exampleData from '../example_data/example-1.json';


const moment = require('moment');
const data = require('../example_data/example-1.json');

const { intialSleepiness, wakeConstant, sleepConstant } = data.params;

// Convert JSON sleep history into more useful format
function parseHistory(history) {
  return history.map( ({date, duration, sleep, wake}) => {
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
      sleep: sleepTime,
      wake: wakeTime,
      duration: record.duration._milliseconds,
      efficiency: record.duration/wakeTime.diff(sleepTime)
    }
  });
}

const sleepHistory = parseHistory(data.sleepHistory);

// Convert sleep history to sleepiness based on params
function convertToSleepinessHistory(sleepHistory) {
  const start = moment(sleepHistory[0].sleep).startOf('day');
  const end = moment(sleepHistory[sleepHistory.length - 1].wake).add(1, 'days').startOf('day');
  const sleepinessHistory = [];

  let currentTime;
  for(let i = 0; i < sleepHistory.length; i++) {
    let {sleep, wake, efficiency} = sleepHistory[i];
    currentTime = moment(sleep);
    while(wake.diff(currentTime) > 0) {
      sleepinessHistory.push({time: moment(currentTime), value: 0.5}); // mock data for now
      currentTime.add(1, 'hour');
    }

    if(i < sleepHistory.length - 1) { // not the last one
      currentTime = moment(wake);
      while(sleepHistory[i+1].sleep.diff(currentTime) > 0) {
        sleepinessHistory.push({time: moment(currentTime), value: 0.6}); // mock data for now
        currentTime.add(1, 'hour');
      }
    } else {
      sleepinessHistory.push({time: moment(wake), value: 0.4}); // mock data for now
    }
  }
  return sleepinessHistory;
}



console.log(convertToSleepinessHistory(sleepHistory));
// console.log(sleepHistory);
