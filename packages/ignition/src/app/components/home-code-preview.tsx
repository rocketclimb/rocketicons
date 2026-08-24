"use client";

import { AnimatedCodeBlock, ScriptAction } from "@rocketclimb/code-block";
import { RcRocketIcon } from "rocketicons/rc";
import RocketIconsText from "@/components/rocketicons-text";

const HomeCodePreview = () => (
  <AnimatedCodeBlock
    className="deep-[4]"
    script={[
      {
        time: "4s",
        action: ScriptAction.UPDATE,
        elementId: "el_0",
        text: "h-32"
      },
      {
        action: ScriptAction.UPDATE,
        elementId: "el_0.el_0",
        text: "size-10"
      },
      {
        action: ScriptAction.UPDATE_TYPING,
        elementId: "el_0.el_0",
        text: " border border-slate-200 dark:border-white",
        delay: 50
      },
      {
        time: "2s",
        action: ScriptAction.UPDATE_TYPING,
        elementId: "el_0",
        text: " flex gap-3",
        delay: 60
      },
      {
        time: "2s",
        action: ScriptAction.UPDATE_TYPING,
        elementId: "el_0.el_0",
        text: " size-32 bg-slate-200 dark:bg-white",
        delay: 50
      },
      {
        time: "5s",
        action: ScriptAction.DELETE_TYPING,
        elementId: "el_0.el_1.el_1.el_1",
        from: "icon-red-900-md",
        to: "icon-",
        skipCommit: true
      },
      {
        action: ScriptAction.UPDATE_TYPING,
        elementId: "el_0.el_1.el_1.el_1",
        text: "sky-500"
      },
      {
        time: "5s",
        action: ScriptAction.UPDATE_TYPING,
        elementId: "el_0.el_1.el_1.el_1",
        text: "-lg"
      },
      {
        time: "2s",
        action: ScriptAction.UPDATE_TYPING,
        elementId: "el_0.el_1.el_1.el_1",
        text: " dark:icon-white-lg",
        delay: 30
      },
      {
        time: "1s",
        action: ScriptAction.UPDATE_TYPING,
        elementId: "el_0.el_1.el_1.el_1",
        text: " mx-1"
      },
      {
        time: "30s",
        action: ScriptAction.REPLACE_TYPING,
        elementId: "el_0.el_1.el_1.el_1",
        text: "icon-slate-900-base dark:icon-red-500-base"
      },
      {
        action: ScriptAction.UPDATE,
        elementId: "el_0",
        text: "h-32"
      },
      {
        action: ScriptAction.UPDATE,
        elementId: "el_0.el_0",
        text: "size-10"
      },
      {
        action: ScriptAction.RESTART
      }
    ]}
  >
    <div className="h-32">
      <RcRocketIcon data-cb-tag="RcRocketIcon" className="size-10" />
      <div>
        <div className="text-primary text-xl xs:text-2xl font-light dark:text-primary-dark mt-1 xs:mt-2">
          <RocketIconsText data-cb-tag="RocketIconsText" />
        </div>
        <div className="mr-2 text-sm xs:text-base">
          Add it. Make it
          <RcRocketIcon
            data-cb-tag="RcRocketIcon"
            className="icon-slate-900-base dark:icon-red-500-base"
          />
          unmistakably yours.
        </div>
        <div className="mt-0.5 text-xs leading-4 xs:leading-6">
          One local component. No full collection.
        </div>
      </div>
    </div>
  </AnimatedCodeBlock>
);

export default HomeCodePreview;
