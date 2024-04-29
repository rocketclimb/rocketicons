"use client";
import { AnimatedCodeBlock, ScriptAction } from "@/components/code-block";
import { Script } from "@/components/code-block/types";

import { useEffect, useState } from "react";
import { CollectionID } from "rocketicons/data";
import IconLoader, { IconHandlerProps } from "@/components/icons/icon-loader";

const Animation = ({
  Icon,
  colors,
  iconName
}: IconHandlerProps & { colors: string[]; iconName: string }) => {
  const [first] = colors;
  const final = `icon-${[...colors].pop()!}`;
  const initial = `icon-${first}`;
  const [state, setState] = useState<string>(initial);
  const [script, setScript] = useState<Script>([]);

  const createScriptColorAction = (from: string, to: string): Script => [
    {
      time: "3s",
      action: ScriptAction.DELETE_TYPING,
      elementId: "el_0.el_0",
      from,
      to: "icon-",
      skipCommit: true
    },
    {
      action: ScriptAction.UPDATE_TYPING,
      elementId: "el_0.el_0",
      text: to
    }
  ];

  useEffect(() => {
    const { script } = colors.slice(1).reduce(
      ({ prev, script }, color) => ({
        prev: `icon-${color}`,
        script: [...script, ...createScriptColorAction(prev, color)]
      }),
      { prev: initial, script: [] as Script }
    );
    setScript(script);
  }, [colors]);

  return (
    <>
      <div className="size-48 order-last sm:order-none flex items-center justify-center border rounded-lg border-slate-200 dark:border-slate-800">
        <Icon className={`transition duration-500 ${state} size-48`} />
      </div>
      <AnimatedCodeBlock
        className="w-96 md:w-[480px]"
        variants="minimalist"
        skipRender={true}
        onCommit={(_, state) => state && setState(state)}
        script={[
          ...script,
          ...createScriptColorAction(final, first),
          {
            action: ScriptAction.RESTART
          }
        ]}
      >
        <div>
          <Icon data-cb-tag={iconName} className={initial} />
        </div>
      </AnimatedCodeBlock>
    </>
  );
};

type ColorsAnimationProsp = {
  icon: string;
  collection: CollectionID;
  colors: string[];
};

// TODO: Allow the IconLoader to pass along the iconName to the handler being called.
const ColorsAnimation = ({ collection, icon, colors }: ColorsAnimationProsp) => (
  <div className="flex h-72 sm:h-48 flex-col sm:flex-row my-12 items-center justify-center gap-4">
    <IconLoader
      collectionId={collection}
      icon={icon}
      iconName={icon}
      Handler={Animation}
      colors={colors}
    />
  </div>
);

export default ColorsAnimation;
