"use client";
import { useState } from "react";

const useWaitToExecute = (
  delay: number
): [(callback: () => Promise<void> | void) => void, () => void, boolean] => {
  let timeOutId: NodeJS.Timeout;
  let pendingCount = 0;

  const [hasPending, setHasPending] = useState<boolean>(false);

  const softCancel = () => timeOutId && clearTimeout(timeOutId);

  const cancel = () => {
    softCancel();
    pendingCount = 0;
    setHasPending(false);
  };

  const execute = (callback: () => void) => {
    pendingCount++;

    softCancel();
    timeOutId = setTimeout(async () => {
      await callback();
      pendingCount--;
      !pendingCount && setHasPending(false);
    }, delay);
    setHasPending(true);
  };

  return [execute, cancel, hasPending];
};

export default useWaitToExecute;
