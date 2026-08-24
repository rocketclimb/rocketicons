"use client";
import { AnimatedCodeBlock, ScriptAction, Script } from "@rocketclimb/code-block";

import QuerySelectedIcon from "@/components/documentation/query-selected-icon";
import { sizes } from "./utils";
import { useEffect, useState } from "react";

const Animation = ({ iconName }: { iconName: string }) => {
  const [state, setState] = useState<string>("icon-base");
  const [script, setScript] = useState<Script>([]);

  useEffect(() => {
    const { script } = [...Object.keys(sizes)].reduce(
      ({ prev, script }, size) => ({
        prev: `icon-${size}`,
        script: [
          ...script,
          {
            time: "3s",
            action: ScriptAction.DELETE_TYPING,
            elementId: "el_0.el_0",
            from: prev,
            to: "icon-",
            skipCommit: true,
            delay: 120
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: `${size}`,
            delay: 120
          }
        ]
      }),
      { prev: "icon-base", script: [] as any[] }
    );
    setScript(script);
  }, []);

  return (
    <>
      <div className="size-48 order-last sm:order-none flex items-center justify-center border rounded-lg border-slate-200 dark:border-slate-800">
        <QuerySelectedIcon className={`transition duration-500 ${state}`} />
      </div>
      <AnimatedCodeBlock
        className="w-[298px] xs:w-[365px] md:w-[500px]"
        variants="minimalist"
        skipRender={true}
        onCommit={(_, state) => state && setState(state)}
        script={[
          ...script,
          {
            time: "3s",
            action: ScriptAction.DELETE_TYPING,
            elementId: "el_0.el_0",
            from: "icon-7xl",
            to: "icon-",
            skipCommit: true,
            delay: 120
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: "base",
            delay: 120
          },
          {
            action: ScriptAction.RESTART
          }
        ]}
      >
        <div>
          <QuerySelectedIcon data-cb-tag={iconName} className="icon-base" />
        </div>
      </AnimatedCodeBlock>
    </>
  );
};

type SizingAnimationProsp = {
  icon: string;
};

const SizingAnimation = ({ icon }: SizingAnimationProsp) => (
  <div className="flex h-48 flex-col sm:flex-row xs:my-12 items-center justify-center gap-4">
    <Animation iconName={icon} />
  </div>
);

export default SizingAnimation;
