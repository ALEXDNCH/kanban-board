export const getLocalStorage = (key) => {
  if (typeof window === "undefined") return;
  try {
    const item = localStorage.getItem(key);
    if (!item || typeof item === 'undefined') return;

    const parsedItem = JSON.parse(item);

    if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
      removeFromLocalStorage(key);
      return;
    }

    return parsedItem.data !== undefined ? parsedItem.data : parsedItem;
  } catch (error) {
    console.error(`Error getting localStorage key: ${key}`, error);
    return null;
  }
};

export const setLocalStorage = (key, data, ttl = null) => {
  if (typeof window === "undefined") return;

  try {
    let item = ttl
      ? {data, expiry: Date.now() + ttl * 60 * 1000} // `ttl` in minutes
      : data;

    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting localStorage key: ${key}`, error);
  }
};

export const removeFromLocalStorage = (key) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key: ${key}`, error);
  }
};