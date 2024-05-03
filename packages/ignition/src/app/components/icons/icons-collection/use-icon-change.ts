import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const useIconChange = (): {
  selected: string;
} => {
  const params = useParams<{ iconid?: string }>();
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    setSelected(params?.iconid ?? "");
  }, [params?.iconid]);

  return { selected };
};

export default useIconChange;
