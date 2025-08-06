/** Utility function to throttle a function call by a specified delay */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = (func: (...args: any[]) => void, delayInMs: number) => {
  let lastTime = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastTime >= delayInMs) {
      lastTime = now;
      func(...args);
    }
  };
};
