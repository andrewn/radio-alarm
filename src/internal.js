import createWebsocket from "/websocket/module.js";
import throttle from "./modules/lodash-es/throttle.js";

import { start, onTick } from "./lib/clock.js";
import { currentTime } from "./lib/time.js";
import { createAlarm, addAlarm, checkAlarms } from "./lib/alarm.js";
import createMediaPlayer, { createAndUseAudio } from "./lib/player.js";
import * as state from "./lib/state.js";

async function fetchConfig() {
  const response = await fetch("./config.json");
  return await response.json();
}

const main = async () => {
  console.log("Clock Radio: internal: app loaded");

  const websocket = createWebsocket();
  await websocket.ready;

  const { stations, alarm } = await fetchConfig();
  const now = currentTime();
  const player = createMediaPlayer(document.body);

  console.log("state:", state.get());
  console.log("config:", stations, alarm);

  const dispatch = function(action) {
    console.log("ACTION", action.type, action.payload);

    switch (action.type) {
      case "PLAY":
        player.play();
        websocket.publish({
          topic: "physical/command/ledrgb-power-change",
          payload: { isOn: true, color: "green" }
        });
        return;
      case "STOP":
        player.pause();
        websocket.publish({
          topic: "physical/command/ledrgb-power-change",
          payload: { isOn: false }
        });
        return;
      case "TOGGLE":
        player.paused ? dispatch({ type: "PLAY" }) : dispatch({ type: "STOP" });
        return;
      case "SOURCE":
        if (action.payload) {
          player.source = action.payload;
          dispatch({ type: "STATE", payload: { station: action.payload.id } });
        }
        return;
      case "STATE":
        state.set(action.payload);
        break;
      case "NEXT":
        const currentIndex = stations.findIndex(el => el === player.source);
        if (currentIndex > -1) {
          const next = stations[(currentIndex + 1) % stations.length];
          if (next) {
            dispatch({ type: "SOURCE", payload: next });
          }
        }
        return;
      case "VOLUME_DOWN":
        player.volume = player.volume - 10;
        return;
      case "VOLUME_UP":
        player.volume = player.volume + 10;
        return;
      default:
        console.log(`No action for type ${action.type}`, action);
    }
  };

  window.dispatch = dispatch;

  // Set initial source
  const stationId = state.get().station;
  let station = stations.find(el => el.id === stationId);
  if (!station) {
    station = stations[0];
  }

  if (station != null) {
    dispatch({ type: "SOURCE", payload: station });
  }

  // Buttons
  websocket.subscribe(
    "physical/event/button-power-release",
    ({ topic, payload }) => {
      console.log("Recieved power press", topic, payload);
      dispatch({ type: "TOGGLE" });
    }
  );

  websocket.subscribe(
    "physical/event/button-next-release",
    ({ topic, payload }) => {
      console.log("Recieved next press", topic, payload);
      dispatch({ type: "NEXT" });
    }
  );

  let lastRotation = 0;

  const handleTurn = throttle(
    function({ topic, payload }) {
      console.log("Recieved encoder turn", topic, payload);
      if (payload.value > lastRotation) {
        dispatch({ type: "VOLUME_UP" });
      } else if (payload.value < lastRotation) {
        dispatch({ type: "VOLUME_DOWN" });
      }

      lastRotation = payload.value;
    },
    100 /* timeout */,
    { leading: true } /* invoke at start */
  );

  websocket.subscribe("physical/event/encoder-power-turn", handleTurn);

  // websocket.subscribe(new RegExp(".*"), ({ topic, payload }) => {
  //   console.log("Recieved power press", topic, payload);
  // });

  // Internal UI
  document.querySelector("#toggle").addEventListener("click", function() {
    dispatch({ type: "TOGGLE" });
  });

  document.querySelector("#next").addEventListener("click", function() {
    dispatch({ type: "NEXT" });
  });

  document.querySelector("#down").addEventListener("click", function() {
    dispatch({ type: "VOLUME_DOWN" });
  });

  document.querySelector("#up").addEventListener("click", function() {
    dispatch({ type: "VOLUME_UP" });
  });

  // Add initial test alarm
  addAlarm(
    createAlarm({
      target: alarm,
      action: { type: "PLAY" }
    })
  );

  onTick(checkAlarms(dispatch));
  start();
};

main();
