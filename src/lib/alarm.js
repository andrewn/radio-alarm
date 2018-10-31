import { absolute, currentTime, format } from "./time.js";

const alarms = [];

export const createAlarm = function(config) {
  return {
    ...config,
    fired: false
  };
};

export const addAlarm = alarm => alarms.push(alarm);

const nearTarget = (target, current) => {
  const distance = absolute(target) - absolute(current);
  const isBefore = distance < 0;
  const isNear = distance < 1;

  if (isBefore) {
    return false;
  }

  if (isNear) {
    return true;
  }

  return false;
};

const unfiredAlarms = () => alarms.filter(({ fired }) => fired === false);
const firedAlarms = () => alarms.filter(({ fired }) => fired === true);

export const checkAlarms = dispatch =>
  function() {
    const time = currentTime();

    console.log(format(time));

    unfiredAlarms().forEach(alarm => {
      if (alarm.fired === false && nearTarget(alarm.target, currentTime())) {
        console.log("Alarm");
        alarm.fired = true;

        try {
          dispatch(Object.assign({}, alarm.action));
        } catch (e) {
          console.error("Error dispatching action for alarm", alarm);
        }
      }
    });

    firedAlarms().forEach(alarm => {
      if (!nearTarget(alarm.target, currentTime())) {
        console.log("Reset alarm: ", alarm.target, alarm);
        alarm.fired = false;
      }
    });
  };
