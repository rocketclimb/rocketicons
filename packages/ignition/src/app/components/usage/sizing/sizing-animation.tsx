"use client";
import { AnimatedCodeBlock, ScriptAction } from "@/components/code-block";
import { Script } from "@/components/code-block/types";
import IconLoader, { IconHandlerProps } from "@/components/icons/icon-loader";

import { sizes } from "./utils";
import { useEffect, useState } from "react";
import { CollectionID } from "rocketicons/data";

const Animation = ({ Icon }: IconHandlerProps) => {
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
            delay: 120,
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: `${size}`,
            delay: 120,
          },
        ],
      }),
      { prev: "icon-base", script: [] as any[] }
    );
    setScript(script);
  }, []);

  return (
    <>
      <div className="size-48 order-last sm:order-none flex items-center justify-center border rounded-lg border-slate-200 dark:border-slate-800">
        <Icon className={`transition duration-500 ${state}`} />
      </div>
      <AnimatedCodeBlock
        className="w-96 md:w-[500px]"
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
            delay: 120,
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: "base",
            delay: 120,
          },
          {
            action: ScriptAction.RESTART,
          },
        ]}
      >
        <div>
          <Icon className="icon-base" />
        </div>
      </AnimatedCodeBlock>
    </>
  );
};

type SizingAnimationProsp = {
  icon: string;
  collection: CollectionID;
};

const SizingAnimation = ({ collection, icon }: SizingAnimationProsp) => (
  <div className="flex h-48 flex-col sm:flex-row my-12 items-center justify-center gap-4">
    <IconLoader collectionId={collection} icon={icon} Handler={Animation} />
  </div>
);

export default SizingAnimation;
