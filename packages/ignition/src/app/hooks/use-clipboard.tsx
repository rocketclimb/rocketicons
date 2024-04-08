import { useState } from "react";

type Clipboard = {
  write: () => void;
  isCurrent: () => boolean;
};

const useClipboard = (text: string): Clipboard => {
  const [current, setCurrent] = useState<string>("");

  return {
    write: () => {
      navigator.clipboard.writeText(text);
      setCurrent(text);
    },
    isCurrent: () => text === current,
  };
};

export default useClipboard;
