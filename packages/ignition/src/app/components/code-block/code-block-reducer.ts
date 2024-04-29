type CodeEditOptions = {
  elementState: string;
  codeState: string;
};

import { Actions, Action } from "./types";

export type CodeEditState = Record<string, CodeEditOptions>;

const initialState: CodeEditOptions = {
  elementState: "",
  codeState: ""
};

export const reducer = (state: CodeEditState, action: Actions) => {
  switch (action.type) {
    case Action.UPDATE: {
      const { id, updating } = action;
      const current = state[id] || initialState;
      return {
        ...state,
        [id]: { ...current, codeState: updating }
      };
    }
    case Action.COMMIT: {
      const { id } = action;
      const { codeState } = state[id] || initialState;
      return {
        ...state,
        [id]: { codeState, elementState: codeState }
      };
    }
  }
};

export const getElementId = (index: number, parent: string = ""): string => {
  const parentText = parent ? `${parent}.` : "";

  return `${parentText}el_${index}`;
};
