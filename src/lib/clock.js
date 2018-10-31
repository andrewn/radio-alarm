import mitt from '../modules/mitt/dist/mitt.es.js';

const emitter = mitt();

export const onTick = handler => emitter.on('tick', handler);
export const start = () => {
  emitter.emit('tick');
  setTimeout(start, 1000 * 5);
};
