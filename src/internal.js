// const appName = window.location.pathname.replace(/\//g, '');
// const websocket = createWebsocket();

import { start, onTick } from "./lib/clock.js";
import { currentTime } from "./lib/time.js";
import { createAlarm, addAlarm, checkAlarms } from "./lib/alarm.js";
import createMediaPlayer, { createAndUseAudio } from "./lib/player.js";
import * as state from "./lib/state.js";

const stations = [
  // radio4: {
  //   type: "hls",
  //   url:
  //     "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/uk/sbr_high/ak/bbc_radio_fourfm.m3u8"
  // },
  {
    id: "radio4",
    type: "dash",
    url:
      "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/dash/nonuk/dash_low/llnw/bbc_radio_fourfm.mpd"
  },
  {
    id: "nts",
    type: "mp3",
    url: "https://stream-relay-geo.ntslive.net/stream2?t=1540991152981"
  }
];

const main = async () => {
  console.log("Clock Radio: internal: app loaded", state.get());

  const now = currentTime();
  const player = createMediaPlayer(document.body);

  const dispatch = function(action) {
    console.log("ACTION", action.type, action.payload);

    switch (action.type) {
      case "PLAY":
        player.play();
        return;
      case "STOP":
        player.pause();
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

  // Internal UI
  document.querySelector("#toggle").addEventListener("click", function() {
    dispatch({ type: "TOGGLE" });
  });

  document.querySelector("#next").addEventListener("click", function() {
    dispatch({ type: "NEXT" });
  });

  // Add initial test alarm
  addAlarm(
    createAlarm({
      target: { hours: now.hours, minutes: now.minutes + 1 },
      action: { type: "PLAY" }
    })
  );

  onTick(checkAlarms(dispatch));
  start();
};

main();
