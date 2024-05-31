"use client";
import ActionButton from "@/components/action-button";
import { useBoxContext } from "./box";

const Reset = () => {
  const { isDirty, reset } = useBoxContext();
  return (
    <>
      {isDirty && (
        <ActionButton onClick={() => reset()} className="absolute bottom-0 left-5">
          Reset
        </ActionButton>
      )}
    </>
  );
};

export default Reset;
