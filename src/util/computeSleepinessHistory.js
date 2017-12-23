import moment from 'moment';
// const data = require('../example_data/example-1.json');

const { initialSleepiness, wakeConstant, sleepConstant } = data.params;

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

// Figure out what x-axis points we want to plot
function generateTimesToPlot(sleepHistory) {
  const start = moment(sleepHistory[0].sleep).startOf('day');
  const end = moment(sleepHistory[sleepHistory.length - 1].wake).add(1, 'days').startOf('day');
  const timesToPlot = [];

  let currentTime;
  for(let i = 0; i < sleepHistory.length; i++) {
    let {sleep, wake, efficiency} = sleepHistory[i];
    currentTime = moment(sleep);
    while(wake.diff(currentTime) > 0) {
      timesToPlot.push({time: moment(currentTime), status: 'asleep', efficiency }); // mock data for now
      currentTime.add(1, 'hour');
    }

    if(i < sleepHistory.length - 1) { // not the last one
      currentTime = moment(wake);
      while(sleepHistory[i+1].sleep.diff(currentTime) > 0) {
        timesToPlot.push({time: moment(currentTime), status: 'awake', efficiency: 0}); // mock data for now
        currentTime.add(1, 'hour');
      }
    } else {
      timesToPlot.push({time: moment(wake), status: 'awake', efficiency: 0}); // mock data for now
    }
  }
  return timesToPlot;
}

// Convert sleep history to sleepiness based on params
export default function convertToSleepinessHistory(sleepHistory, initialSleepiness, wakeConst, sleepConst) {
  const timesToPlot = generateTimesToPlot(sleepHistory);
  const sleepinessHistory = [];
  let status = 'asleep';

  // "trans" = last point of transition (falling asleep or waking up)
  let transTime = moment(timesToPlot[0].time);
  let transSleepiness = initialSleepiness;
  let eff = timesToPlot[0].efficiency;

  // generate sleepiness for each timestamp
  for(let i = 0; i < timesToPlot.length; i++) {
    let record = timesToPlot[i];

    // compute sleepiness
    let hoursSinceTrans = record.time.diff(transTime)/3600000; // millseconds to hours
    let sleepiness = 1 - (1-transSleepiness * Math.pow(sleepConst, eff*hoursSinceTrans)) * Math.pow(wakeConst, (1-eff) * hoursSinceTrans)

    // for debugging
    // console.log(record.time.format("M/D/YYYY hh:mm:ss a") + ', ' + status + ', ' + sleepiness);

    sleepinessHistory.push({
      time: record.time,
      status: record.status,
      efficiency: record.efficiency,
      sleepiness
    })

    // change status if needed
    if(status !== record.status) {
      status = record.status;
      transTime = moment(record.time);
      transSleepiness = sleepiness;
    }

    // update efficiency for next calculation
    eff = record.efficiency;
  }

  return sleepinessHistory;
}


// convertToSleepinessHistory(sleepHistory, initialSleepiness, wakeConstant, sleepConstant);
