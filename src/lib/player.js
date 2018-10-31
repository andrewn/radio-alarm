import "../modules/dashjs/dist/dash.all.min.js";

class DashPlayer {
  constructor(root, url) {
    this.media = createAndUseAudio(root);
    this.dashPlayer = dashjs.MediaPlayer().create();
    this.dashPlayer.initialize(this.media, url, false /* autoplay */);
  }

  play() {
    this.dashPlayer.play();
  }

  pause() {
    this.dashPlayer.pause();
  }

  get paused() {
    return this.dashPlayer.isPaused();
  }

  get volume() {
    return this.media.volume;
  }

  set volume(value) {
    this.media.volume = value;
  }

  destroy() {
    this.dashPlayer.reset();
    removeAudio(this.media);
  }
}

class Mp3Player {
  constructor(root, url) {
    this.media = createAndUseAudio(root);
    this.media.src = url;
  }

  play() {
    this.media.play();
  }

  pause() {
    this.media.pause();
  }

  get paused() {
    return this.media.paused;
  }

  get volume() {
    return this.media.volume;
  }

  set volume(value) {
    this.media.volume = value;
  }

  destroy() {
    this.media.pause();
    removeAudio(this.media);
  }
}

export default function(root) {
  let source = null;
  let player = null;

  return {
    play() {
      player.play();
    },

    pause() {
      player.pause();
    },

    get paused() {
      return player.paused;
    },

    get source() {
      return source;
    },

    get volume() {
      return player.volume * 100;
    },

    set volume(value) {
      let clamped = value;
      if (value < 0) {
        clamped = 0;
      }

      if (value > 100) {
        clamped = 100;
      }

      player.volume = clamped / 100;
    },

    set source(value) {
      const { url, type } = value;
      let Player = null;
      const shouldPlay = player && !player.paused;

      switch (type) {
        case "mp3":
          Player = Mp3Player;
          break;
        case "dash":
          Player = DashPlayer;
          break;
        default:
          console.warn(`Unknown source type ${type}`);
      }

      if (Player) {
        player && player.destroy();
        player = new Player(root, url);
      }

      if (shouldPlay) {
        player.play();
      }

      source = value;
    }
  };
}

export const createAndUseAudio = function(root) {
  const media = document.createElement("audio");
  root.appendChild(media);
  return media;
};

export const removeAudio = function(media) {
  if (media && media.parentNode) {
    media.parentNode.removeChild(media);
  }
};
