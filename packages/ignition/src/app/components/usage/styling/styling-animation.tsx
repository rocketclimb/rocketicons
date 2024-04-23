"use client";
import { AnimatedCodeBlock, ScriptAction } from "@/components/code-block";

import { useState } from "react";
import { CollectionID } from "rocketicons/data";
import IconLoader, { IconHandlerProps } from "@/components/icons/icon-loader";

const Animation = ({
  Icon,
  iconName,
}: IconHandlerProps & { iconName: string }) => {
  const initialIconColor = "icon-rose-500";
  const [state, setState] = useState<string>(initialIconColor);

  return (
    <>
      <div className="size-48 order-last sm:order-none flex items-center justify-center">
        <Icon className={`transition duration-500 ${state} size-48`} />
      </div>
      <AnimatedCodeBlock
        className="w-96 md:w-[480px]"
        variants="minimalist"
        skipRender={true}
        onCommit={(_, state) => state && setState(state)}
        script={[
          {
            time: "3s",
            action: ScriptAction.UPDATE,
            elementId: "el_0.el_0",
            text: `${initialIconColor}`,
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: " border border-red-500",
          },
          {
            time: "3s",
            action: ScriptAction.DELETE_TYPING,
            elementId: "el_0.el_0",
            from: `${initialIconColor} border border-red-500`,
            to: `${initialIconColor} border border-`,
            skipCommit: true,
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: "slate-600",
          },
          {
            time: "3s",
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: " rounded-md",
          },
          {
            time: "3s",
            action: ScriptAction.DELETE_TYPING,
            elementId: "el_0.el_0",
            from: `${initialIconColor} border border-slate-600 rounded-md`,
            to: `${initialIconColor} border border-slate-600 rounded-`,
            skipCommit: true,
          },
          {
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: "lg",
          },
          {
            time: "3s",
            action: ScriptAction.UPDATE_TYPING,
            elementId: "el_0.el_0",
            text: " bg-slate-50",
          },
          {
            time: "15s",
            action: ScriptAction.DELETE_TYPING,
            elementId: "el_0.el_0",
            from: `${initialIconColor} border border-slate-600 rounded-xl bg-slate-50`,
            to: initialIconColor,
            skipCommit: false,
          },
          {
            action: ScriptAction.RESTART,
          },
        ]}
      >
        <div>
          <Icon data-cb-tag={iconName} className={initialIconColor} />
        </div>
      </AnimatedCodeBlock>
    </>
  );
};

type StylingAnimationProsp = {
  icon: string;
  collection: CollectionID;
};

const StylingAnimation = ({ collection, icon }: StylingAnimationProsp) => (
  <div className="flex h-72 sm:h-48 flex-col sm:flex-row my-12 items-center justify-center gap-4">
    <IconLoader
      collectionId={collection}
      icon={icon}
      iconName={icon}
      Handler={Animation}
    />
  </div>
);

export default StylingAnimation;
