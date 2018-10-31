export const currentTime = function() {
  const now = new Date();
  return { hours: now.getHours(), minutes: now.getMinutes() };
};

export const absolute = function({ hours, minutes }) {
  return hours * 60 + minutes;
};

export const format = ({ hours, minutes }) =>
  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
