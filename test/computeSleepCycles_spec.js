import {expect} from 'chai';
import moment from 'moment';
import computeSleepinessHistory from '../src/util/computeSleepinessHistory';

//computeSleepinessHistory(sleepHistory, initialSleepiness, wakeConst, sleepConst)

describe('computeSleepinessHistory', () => {
  it('does not mutate sleep history', () => {
    const sleepHistory = [
      { "date": "11/4/17", "duration": "7:23", "sleep":	"0:27", "wake": "8:39" },
      { "date": "11/5/17", "duration": "7:12", "sleep":	"22:32", "wake":	"5:19" }
    ];
    const sleepHistoryClone = sleepHistory.map( record => ({...record})); // create a clone
    computeSleepinessHistory(sleepHistory, 0.85, 0.91, 0.73);
    expect(sleepHistory).to.deep.equal(sleepHistoryClone);
  });

  it('creates an array with time, sleepiness, status, efficiency', () => {
    const sleepHistory = [
      { "date": "11/4/17", "duration": "7:23", "sleep":	"0:27", "wake": "8:39" },
      { "date": "11/5/17", "duration": "7:12", "sleep":	"22:32", "wake":	"5:19" }
    ];
    const sleepiness = computeSleepinessHistory(sleepHistory, 0.85, 0.91, 0.73);
    sleepiness.forEach(record => {
      expect(record).to.have.all.keys('time', 'sleepiness', 'status', 'efficiency');
    })

  });

  it('provides results from start of first sleep cycle to end of final sleep cycle', () => {
    let sleepHistory = [
      { "date": "11/4/17", "duration": "7:23", "sleep":	"0:27", "wake": "8:39" },
      { "date": "11/5/17", "duration": "7:12", "sleep":	"22:32", "wake":	"5:19" }
    ];
    const sleepiness = computeSleepinessHistory(sleepHistory, 0.85, 0.91, 0.73);
    const maxTime = sleepiness.reduce((acc, record) => acc.diff(record.time) > 0 ? acc : record.time, moment(1));
    const minTime = sleepiness.reduce((acc, record) => acc.diff(record.time) < 0 ? acc : record.time, moment('01-2020', 'MM-YYYY'));
    expect(maxTime.milliseconds()).to.equal(moment('11/5/2017 5:19 am', 'M/D/YYYY h:mm a').milliseconds());
    expect(minTime.milliseconds()).to.equal(moment('11/4/2017 12:27 am', 'M/D/YYYY h:mm a').milliseconds());
  });

  it('deduces when sleep began the previous day', () => {
    let sleepHistory = [
      { "date": "11/4/17", "duration": "7:23", "sleep":	"21:27", "wake": "5:39" },
      { "date": "11/5/17", "duration": "7:12", "sleep":	"22:32", "wake":	"5:19" }
    ];
    const sleepiness = computeSleepinessHistory(sleepHistory, 0.85, 0.91, 0.73);
    const minTime = sleepiness.reduce((acc, record) => acc.diff(record.time) < 0 ? acc : record.time, moment('01-2020', 'MM-YYYY'));
    expect(minTime.milliseconds()).to.equal(moment('11/3/2017 12:27 am', 'M/D/YYYY h:mm a').milliseconds());
  });

  xit('it computes the right hours within and without DST');
  it('appropriately labels status: awake, asleep, waking-up, falling-asleep', () => {
    let sleepHistory = [
      // { "date": "11/4/17", "duration": "7:23", "sleep":	"9:27", "wake": "5:39" },
      { "date": "11/4/17", "duration": "7:23", "sleep":	"0:27", "wake": "8:39" },
      { "date": "11/5/17", "duration": "7:12", "sleep":	"22:32", "wake":	"5:19" }
    ];
    const sleepiness = computeSleepinessHistory(sleepHistory, 0.85, 0.91, 0.73);
    let foundItems = [];
    for(let i=1; i<sleepiness.length-1; i++) {
      let {status} = sleepiness[i];
      foundItems[status] = status;
      if(status === 'asleep') {
        expect(sleepiness[i].sleepiness, 'incorrectly marked "asleep"').to.be.below(sleepiness[i-1].sleepiness);
        expect(sleepiness[i].sleepiness, 'incorrectly marked "asleep"' + sleepiness[i].sleepiness).to.be.above(sleepiness[i+1].sleepiness);
      } else if(status === 'awake') {
        expect(sleepiness[i].sleepiness, 'incorrectly marked "awake"').to.be.above(sleepiness[i-1].sleepiness);
        expect(sleepiness[i].sleepiness, 'incorrectly marked "awake"').to.be.below(sleepiness[i+1].sleepiness);
      } else if(status === 'falling-asleep') {
        expect(sleepiness[i].sleepiness, 'incorrectly marked "falling-asleep"').to.be.above(sleepiness[i-1].sleepiness);
        expect(sleepiness[i].sleepiness, 'incorrectly marked "falling-asleep"').to.be.above(sleepiness[i+1].sleepiness);
      } else if(status === 'waking-up') {
        expect(sleepiness[i].sleepiness, 'incorrectly marked "waking-up"').to.be.below(sleepiness[i-1].sleepiness);
        expect(sleepiness[i].sleepiness, 'incorrectly marked "waking-up"').to.be.below(sleepiness[i+1].sleepiness);
      } else {
        expect.fail('status is not one of the expected: "' + status + '"');
      }
    }
    expect(foundItems).to.have.all.keys('asleep', 'awake', 'falling-asleep', 'waking-up');
  });

});
