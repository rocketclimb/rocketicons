"use client";
import { IconType } from "rocketicons";
import { AnimatedCodeBlock, ScriptAction } from "@/components/code-block";
import { Script } from "@/components/code-block/types";

import { shuffle, putVariantsOnIt } from "./utils";
import { useIconsData } from "@/components/icons/use-icons-data";
import { useEffect, useState } from "react";
import { CollectionID } from "rocketicons/data";

type ColorsAnimationProsp = {
  icon: string;
  collection: CollectionID;
  colors: string[];
};

const ColorsAnimation = ({
  collection,
  icon,
  colors,
}: ColorsAnimationProsp) => {
  const [icons, , isLoaded] = useIconsData(collection);
  const [Icon, setIcon] = useState<IconType>();
  const [state, setState] = useState<string>("icon-slate-200");
  const [script, setScript] = useState<Script>([]);

  useEffect(() => {
    const { script } = shuffle([
      ...colors.slice(0, 3).map((color) => `${color}`),
      ...putVariantsOnIt(colors.slice(-3)),
    ]).reduce(
      ({ prev, script }, color) => ({
        prev: `icon-${color}`,
        script: [
          ...script,
          {
            time: "3s",
            action: ScriptAction.DELETE_TYPING,
            elementId: "el_0.el_0",
            from: prev,
            to: "icon-",
            skipCommit: true,
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: `${color}`,
          },
        ],
      }),
      { prev: "icon-slate-200", script: [] as any[] }
    );
    setScript(script);
  }, []);

  useEffect(() => {
    isLoaded && setIcon(() => icons.getByName(icon));
  }, [isLoaded]);

  return (
    <>
      {Icon && (
        <div className="flex my-12 items-center justify-center gap-12">
          <div className="border border-slate-200 rounded-lg dark:border-slate-800">
            <Icon className={`transition duration-500 ${state} size-48`} />
          </div>
          <AnimatedCodeBlock
            className="w-[500px]"
            variants="minimalist"
            skipRender={true}
            onCommit={(_, state) => state && setState(state)}
            script={[
              ...script,
              {
                action: ScriptAction.RESTART,
              },
            ]}
          >
            <div>
              <Icon className="icon-slate-200" />
            </div>
          </AnimatedCodeBlock>
        </div>
      )}
    </>
  );
};

export default ColorsAnimation;
