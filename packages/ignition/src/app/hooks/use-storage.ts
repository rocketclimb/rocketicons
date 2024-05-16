import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

const useStorage = <T>(
  key: string,
  initialValue?: T,
  justAsFailBack?: boolean
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] => {
  const initial = justAsFailBack ? undefined : initialValue;
  const failBack = justAsFailBack ? initialValue : undefined;

  const storage = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value)
  };

  const [storedValue, setStoredValue] = useState<T | undefined>(initial);

  const init = async () => {
    if (initial) {
      setStoredValue(initial);
    } else {
      loadValue();
    }
  };

  const loadValue = useCallback(async () => {
    const value = await storage.getItem(key);
    if (value !== null) {
      setStoredValue(JSON.parse(value) as T);
    } else if (failBack !== undefined) {
      setStoredValue(failBack);
    }
  }, []);

  const persistValue = useCallback(
    async (value: T) => {
      try {
        await storage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(
          new CustomEvent<string>(`storage.${key}`, {
            detail: JSON.stringify(value)
          })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [storedValue]
  );

  useEffect(() => {
    init();
    const onStorageChange = ({ detail }: CustomEvent<string>) => {
      setStoredValue(JSON.parse(detail) as T);
    };
    window.addEventListener(`storage.${key}`, (event) =>
      onStorageChange(event as CustomEvent<string>)
    );

    return () =>
      window.removeEventListener(
        `storage.${key}`,
        onStorageChange as EventListenerOrEventListenerObject
      );
  }, []);

  useEffect(() => {
    storedValue !== undefined && persistValue(storedValue);
  }, [storedValue]);

  return [storedValue, setStoredValue];
};

export default useStorage;
