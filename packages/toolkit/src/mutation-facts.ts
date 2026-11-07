import { AsyncLocalStorage } from "node:async_hooks";

const activeCapture = new AsyncLocalStorage<{ iconsAdded: number }>();

export const hasIconAdditionCapture = () => activeCapture.getStore() !== undefined;

/** @internal Optional in-process observation; never changes a toolkit result or performs I/O. */
export const captureIconAdditions = async <T>(work: () => T | Promise<T>) => {
  const facts = { iconsAdded: 0 };
  const value = await activeCapture.run(facts, work);
  return { value, iconsAdded: facts.iconsAdded };
};

/** Record only after the component writes and manifest registration have succeeded. */
export const recordIconAdditions = (count: number) => {
  const facts = activeCapture.getStore();
  if (facts) facts.iconsAdded += count;
};
