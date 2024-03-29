import { useState, useEffect } from "react";
import { TypeWritter } from "./types";

const useTypeWritter = (): TypeWritter => {
  const [delay, setDelay] = useState<number>(0);

  const [text, setText] = useState<string>("");
  const [currentText, setCurrentText] = useState<string>();

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [isDone, setIsDone] = useState<boolean>(false);
  const [isBackspacing, setIsBackspacing] = useState<boolean>(false);

  const [onUpdate, setOnUpdate] = useState<(text: string) => void>(() => {});
  const [onComplete, setOnComplete] = useState<() => void>(() => {});

  const typingForward = () => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => (prevText || "") + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      setIsDone(true);
    }
  };

  const typingBackward = () => {
    if (currentText !== text) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) =>
          (prevText || "").slice(0, currentIndex - 1)
        );
        setCurrentIndex((prevIndex) => prevIndex - 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      setIsDone(true);
    }
  };

  useEffect(() => {
    if (!text || isDone) {
      return;
    }
    isBackspacing ? typingBackward() : typingForward();
  }, [currentIndex, delay, text]);

  useEffect(() => {
    currentText !== undefined && onUpdate(currentText);
  }, [currentText]);

  useEffect(() => {
    isDone && onComplete();
  }, [isDone]);

  const typeFoward = (
    text: string,
    onUpdate: (text: string) => void,
    onComplete: () => void = () => {},
    current: string | undefined,
    delay: number = 100
  ) => {
    setIsBackspacing(false);
    setOnUpdate(() => onUpdate);
    setOnComplete(() => onComplete);
    setDelay(delay === undefined ? 100 : delay);
    setCurrentIndex(0);
    setCurrentText(current);
    setIsDone(false);
    setText(text);
  };

  const backspacing = (
    from: string,
    to: string,
    onUpdate: (text: string) => void,
    onComplete: () => void = () => {},
    delay: number = 100
  ) => {
    setIsBackspacing(true);
    setOnUpdate(() => onUpdate);
    setOnComplete(() => onComplete);
    setDelay(delay === undefined ? 100 : delay);
    setCurrentIndex(from.length);
    setCurrentText(from);
    setIsDone(false);
    setText(to);
  };

  return { typeFoward, backspacing };
};

export default useTypeWritter;
