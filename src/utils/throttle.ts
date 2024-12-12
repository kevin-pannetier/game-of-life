/**
 * Throttles a function, ensuring it is only called once every `limit` milliseconds.
 * @param func - The function to throttle.
 * @param limit - The minimum delay (in milliseconds) between invocations.
 * @returns A throttled version of the provided function.
 */
function throttle<Args extends unknown[]>(
  func: (...args: Args) => void,
  limit: number,
): (...args: Args) => void {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args): void => {
    const now = Date.now();

    const invoke = () => {
      lastCall = now;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    if (now - lastCall >= limit) {
      invoke();
    } else {
      timeout = setTimeout(
        () => {
          invoke();
        },
        limit - (now - lastCall),
      );
    }
  };
}

export default throttle;
