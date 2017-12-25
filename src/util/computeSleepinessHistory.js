import moment from 'moment';
// const data = require('../example_data/example-1.json');
// const { initialSleepiness, wakeConstant, sleepConstant } = data.params;

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

function calculateSleepiness(referenceSleepiness, hoursSinceReference, efficiency, sleepConst, wakeConst) {
  return 1 - (1-referenceSleepiness * Math.pow(sleepConst, efficiency*hoursSinceReference)) * Math.pow(wakeConst, (1-efficiency) * hoursSinceReference);
}

function markTransitions(array) {
  if(array[0].status === 'awake') return [{...array[0], status: 'waking-up'}, ...array.slice(1)];
  if(array[0].status === 'asleep') return [{...array[0], status: 'falling-asleep'}, ...array.slice(1)];
  return array;
}

// Compute sleepiness trends during one sleep period or one wake period
function fillSleepinessValues(array, startSleepiness, status, efficiency, startTime, endTime, wakeConst, sleepConst) {
  const sleepinessValues = [];
  for(let time = startTime.clone(); time.diff(endTime) < 0; time.add(1, 'hours')) {
    sleepinessValues.push({
      time: time.clone(), status, efficiency,
      sleepiness: calculateSleepiness(startSleepiness, time.diff(startTime)/3600000, efficiency, sleepConst, wakeConst)
    });
  }
  let time = endTime;
  sleepinessValues.push({
    time: time.clone(), status, efficiency,
    sleepiness: calculateSleepiness(startSleepiness, time.diff(startTime)/3600000, efficiency, sleepConst, wakeConst)
  });
  return [...array, ...markTransitions(sleepinessValues)];
}

// Given a sleep history, compute sleepiness over time in 1 hour increments (plus datapoints at transitions)
export default function computeSleepinessHistory(sleepHistory_unparsed, initialSleepiness, wakeConst, sleepConst) {
  const sleepHistory = parseHistory(sleepHistory_unparsed);
  let sleepinessHistory = [];
  let sleepiness = initialSleepiness;

  while(sleepHistory.length > 0) {
    let {sleep, wake, efficiency} = sleepHistory.shift();

    // SLEEP Period
    sleepinessHistory.pop();
    sleepinessHistory = fillSleepinessValues(sleepinessHistory, sleepiness, 'asleep', efficiency, sleep, wake, wakeConst, sleepConst);
    sleepiness = sleepinessHistory[sleepinessHistory.length-1].sleepiness;

    // WAKE Period
    if(sleepHistory.length > 0) {
      let nextSleep = sleepHistory[0].sleep;
      sleepinessHistory.pop();
      sleepinessHistory = fillSleepinessValues(sleepinessHistory, sleepiness, 'awake', 0, wake, nextSleep, wakeConst, sleepConst);
      sleepiness = sleepinessHistory[sleepinessHistory.length-1].sleepiness;
    }
  }

  console.log(sleepinessHistory);
  return sleepinessHistory;

}
