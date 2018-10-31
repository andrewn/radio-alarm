// const appName = window.location.pathname.replace(/\//g, '');
// const websocket = createWebsocket();

import { start, onTick } from "./lib/clock.js";
import { currentTime } from "./lib/time.js";
import { createAlarm, addAlarm, checkAlarms } from "./lib/alarm.js";
import createMediaPlayer, { createAndUseAudio } from "./lib/player.js";

const stations = {
  radio4: {
    type: "hls",
    url:
      "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/uk/sbr_high/ak/bbc_radio_fourfm.m3u8"
  },
  nts: {
    type: "mp3",
    url: "https://stream-relay-geo.ntslive.net/stream2?t=1540991152981"
  }
};

const main = async () => {
  console.log("Clock Radio: internal: app loaded");

  const now = currentTime();
  const player = createMediaPlayer(createAndUseAudio(document.body));

  const dispatch = function(action) {
    console.log("ACTION", action);

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
      default:
        console.log(`No action for type ${action.type}`, action);
    }
  };

  window.dispatch = dispatch;

  player.source = stations.radio4;

  document.querySelector("#toggle").addEventListener("click", function() {
    dispatch({ type: "TOGGLE" });
  });

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
