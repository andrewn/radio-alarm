const storage = window.localStorage;
const STORAGE_KEY = "CLOCK_RADIO";

export const get = function() {
  try {
    const raw = storage.getItem(STORAGE_KEY) || "{}";
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error fetching state`, error);
  }
};

export const set = function(patch) {
  const patched = { ...get(), ...patch };
  const raw = JSON.stringify(patched);
  storage.setItem(STORAGE_KEY, raw);
  console.log("Write state", patched);
  return patched;
};
