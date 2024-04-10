"use client";
import { IconType } from "rocketicons";
import { AnimatedCodeBlock, ScriptAction } from "@/components/code-block";
import { Script } from "@/components/code-block/types";

import { sizes } from "./utils";
import { useIconsData } from "@/components/icons/use-icons-data";
import { useEffect, useState } from "react";
import { CollectionID } from "rocketicons/data";

type SizingAnimationProsp = {
  icon: string;
  collection: CollectionID;
};

const SizingAnimation = ({ collection, icon }: SizingAnimationProsp) => {
  const [icons, , isLoaded] = useIconsData(collection);
  const [Icon, setIcon] = useState<IconType>();
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

  useEffect(() => {
    isLoaded && setIcon(() => icons.getByName(icon));
  }, [isLoaded]);

  return (
    <>
      {Icon && (
        <div className="flex flex-col sm:flex-row my-12 items-center justify-center gap-4">
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
        </div>
      )}
    </>
  );
};

export default SizingAnimation;
