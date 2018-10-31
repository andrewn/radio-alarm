export default function(media) {
  return {
    play: media.play.bind(media),
    pause: media.pause.bind(media),
    get paused() {
      return media.paused;
    },
    set paused(value) {
      media.paused = value;
    },
    set source({ url, type }) {
      switch (type) {
        case "mp3":
          media.src = url;
          return;
        default:
          console.warn(`Unknown source type ${type}`);
      }
    }
  };
}

export const createAndUseAudio = function(root) {
  const media = document.createElement("video");
  root.appendChild(media);
  return media;
};
