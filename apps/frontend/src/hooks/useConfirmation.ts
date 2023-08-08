import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useConfirmation(seconds: number): {
  confirmed: boolean;
  setConfirmed: Dispatch<SetStateAction<boolean>>;
  confirmationTimer: number;
} {
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationTimer, setConfirmationTimer] = useState(seconds);

  useEffect(() => {
    let timer: number;
    let raf: number;

    let startTime: number;
    const createTimer: FrameRequestCallback = (ms) => {
      if (startTime === undefined) {
        startTime = ms;
      }
      const elapsed = ms - startTime;
      setConfirmationTimer(Math.floor(seconds - elapsed / 1000));
      raf = window.requestAnimationFrame(createTimer);
    };

    if (confirmed) {
      timer = window.setTimeout(() => setConfirmed(false), 5000);
      raf = window.requestAnimationFrame(createTimer);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [confirmed, seconds]);

  return {
    confirmed,
    setConfirmed,
    confirmationTimer,
  };
}
