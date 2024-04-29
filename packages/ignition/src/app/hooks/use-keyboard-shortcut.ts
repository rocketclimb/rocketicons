"use client";
import { useEffect, useCallback } from "react";

type OptionalConfig = Pick<KeyboardEvent, "altKey" | "ctrlKey" | "shiftKey" | "metaKey">;

interface ShortcutConfig extends Partial<OptionalConfig> {
  code: KeyboardEvent["code"];
  shortcutTarget?: HTMLElement;
}

type ShortcutAction = (e: KeyboardEvent) => void;

const useKeyboardShortcut = (shortcutAction: ShortcutAction, config: ShortcutConfig) => {
  const eventHandler = useCallback(
    (e: KeyboardEvent) => {
      const { code, ctrlKey, altKey, shiftKey, metaKey } = e;
      if (config.code !== code) return;
      if (config.ctrlKey && !ctrlKey) return;
      if (config.shiftKey && !shiftKey) return;
      if (config.altKey && !altKey) return;
      if (config.metaKey && !metaKey) return;

      shortcutAction(e);
    },
    [shortcutAction, config]
  );

  useEffect(() => {
    const targetElement = config.shortcutTarget || document;
    targetElement.addEventListener("keydown", eventHandler as EventListener);
    return () => targetElement.removeEventListener("keydown", eventHandler as EventListener);
  }, [config.shortcutTarget, eventHandler]);
};

export default useKeyboardShortcut;
