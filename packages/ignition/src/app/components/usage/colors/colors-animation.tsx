"use client";
import { AnimatedCodeBlock, ScriptAction, Script } from "@rocketclimb/code-block";

import { useEffect, useState } from "react";
import { CollectionID } from "rocketicons/data";
import IconLoader, { IconHandlerProps } from "@/components/icons/icon-loader";

const Animation = ({
  Icon,
  colors,
  iconInfo: { compName: iconName }
}: IconHandlerProps & { colors: string[] }) => {
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
      <div className="size-20 xs:size-32 lg:size-48 order-last sm:order-none flex items-center justify-center border rounded-lg border-slate-200 dark:border-slate-800">
        <Icon className={`transition duration-500 ${state} size-20 xs:size-32 lg:size-48`} />
      </div>
      <AnimatedCodeBlock
        className="w-[298px] xs:w-[365px] md:w-[480px]"
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

const ColorsAnimation = ({ collection, icon, colors }: ColorsAnimationProsp) => (
  <div className="flex h-52 sm:h-48 flex-col sm:flex-row my-3 xs:my-12 items-center justify-center gap-4">
    <IconLoader collectionId={collection} icon={icon} Handler={Animation} colors={colors} />
  </div>
);

export default ColorsAnimation;
