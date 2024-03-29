import { useEffect, useState } from "react";
import {
  Script,
  ScriptAction,
  ScriptActionType as Action,
  ElementId,
  TypeWritter,
} from "./types";
import useTypeWritter from "./use-type-writter";

type StateHandler = {
  current: (elementid: ElementId) => string;
  update: (elementId: ElementId, updating: string) => void;
  commit: (ElementId: ElementId) => void;
};

type Done = (action?: number) => void;

const useActionBuilder =
  (
    { typeFoward, backspacing }: TypeWritter,
    { commit, update, current }: StateHandler
  ) =>
  (script: ScriptAction) => {
    const createDeleteAction = (
      done: Done,
      elementId: ElementId,
      from: string,
      to: string,
      skipCommit: boolean,
      delay: number | undefined
    ) =>
      backspacing(
        from,
        to,
        (updating: string) => update(elementId, updating),
        () => {
          !skipCommit && commit(elementId);
          done();
        },
        delay
      );

    switch (script.action) {
      case Action.UPDATE: {
        const { elementId, text, skipCommit } = script;
        return (done: Done) => {
          update(elementId, text);
          !skipCommit && commit(elementId);
          done();
        };
      }
      case Action.UPDATE_TYPING: {
        const { elementId, text, skipCommit, delay } = script;
        return (done: Done) => {
          typeFoward(
            text,
            (updating: string) => update(elementId, updating),
            () => {
              !skipCommit && commit(elementId);
              done();
            },
            current(elementId),
            delay
          );
        };
      }
      case Action.REPLACE_TYPING: {
        const { elementId, text, skipCommit, delay } = script;
        return (done: Done) => {
          typeFoward(
            text,
            (updating: string) => update(elementId, updating),
            () => {
              !skipCommit && commit(elementId);
              done();
            },
            undefined,
            delay
          );
        };
      }
      case Action.DELETE_TYPING: {
        const { elementId, from, to, skipCommit, delay } = script;
        return (done: Done) =>
          createDeleteAction(done, elementId, from, to, !!skipCommit, delay);
      }
      case Action.DELETE_ALL_TYPING: {
        const { elementId, text, skipCommit, delay } = script;
        return (done: Done) =>
          createDeleteAction(done, elementId, text, "", !!skipCommit, delay);
      }
      case Action.RESTART: {
        return (done: Done) => done(0);
      }
    }
  };

const useScriptRunner = (script: Script, stateHandler: StateHandler) => {
  const [currentAction, setAction] = useState<number>();
  const actionBuilder = useActionBuilder(useTypeWritter(), stateHandler);

  const runnAction = () => {
    const current = script[currentAction || 0];
    if (current) {
      const { time } = current;
      const action = actionBuilder(current);
      const done = (action?: number) => {
        action !== undefined
          ? setAction(action)
          : setAction((action) => (action || 0) + 1);
      };
      if (time) {
        const timeout = setTimeout(() => {
          action(done);
        }, parseFloat(time) * 1000);
        return () => clearTimeout(timeout);
      } else {
        action(done);
      }
    }
  };

  useEffect(() => {
    if (currentAction !== undefined) {
      return runnAction();
    } else if (script.length) {
      setAction(0);
    }
  }, [currentAction]);
};

export default useScriptRunner;
