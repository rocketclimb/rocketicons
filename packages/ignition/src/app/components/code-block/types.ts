export enum Action {
  UPDATE = "update",
  COMMIT = "commit"
}

type UpdateAction = {
  type: Action.UPDATE;
  id: string;
  updating: string;
};

type CommitAction = {
  type: Action.COMMIT;
  id: string;
};

export type Actions = UpdateAction | CommitAction;

export type DataChildren = string | undefined | DataElement;

export type DataElement = {
  tag: string;
  props: Record<string, string>;
  children: DataChildren | DataChildren[];
};

export type TWOnUpdate = (text: string) => void;
export type TWOnComplete = (text: string | undefined) => void;

export type TypeWritter = {
  typeFoward: (
    text: string,
    onUpdate: TWOnUpdate,
    onComplete: TWOnComplete,
    current?: string | undefined,
    delay?: number
  ) => void;
  backspacing: (
    from: string,
    to: string,
    onUpdate: TWOnUpdate,
    onComplete: TWOnComplete,
    delay?: number
  ) => void;
};

export enum ScriptActionType {
  UPDATE_TYPING = "update.typing",
  REPLACE_TYPING = "replace.typing",
  DELETE_TYPING = "delete.typing",
  DELETE_ALL_TYPING = "delete.all.typing",
  UPDATE = "update",
  RESTART = "restart"
}

export type ElementId = `el_${string}`;

type ScriptItem = {
  time?: `${number}s` | `${number} s`;
};

type ScriptRestart = ScriptItem & {
  action: ScriptActionType.RESTART;
};

type ScriptChange = ScriptItem & {
  elementId: ElementId;
  skipCommit?: boolean;
};

type ScriptUpdate = ScriptChange & {
  action: ScriptActionType.UPDATE;
  text: string;
};

type ScriptTyping = {
  delay?: number;
};

type ScriptUpdateTyping = Omit<ScriptUpdate, "action"> & {
  action: ScriptActionType.UPDATE_TYPING;
} & ScriptTyping;

type ScriptReplaceTyping = Omit<ScriptUpdate, "action"> & {
  action: ScriptActionType.REPLACE_TYPING;
} & ScriptTyping;

type ScriptDeleteTyping = ScriptChange & {
  action: ScriptActionType.DELETE_TYPING;
  from: string;
  to: string;
} & ScriptTyping;

type ScriptDeleteAllTyping = ScriptChange & {
  action: ScriptActionType.DELETE_ALL_TYPING;
  text: string;
} & ScriptTyping;

export type ScriptAction =
  | ScriptRestart
  | ScriptUpdate
  | ScriptUpdateTyping
  | ScriptReplaceTyping
  | ScriptDeleteTyping
  | ScriptDeleteAllTyping;

export type Script = ScriptAction[];

export type OnScriptCommit = (el: ElementId, state: string | undefined) => void;

export type Tab = { id: string; name: string };

export type TabsProps = (string | Tab)[];

export type OnTabChange = (index: number, tab: string | Tab) => void;

export type Attrs = Record<string, string>;

export type CodeStylerVariations = "full" | "minimalist" | "compact";

export enum CodeElementTabs {
  DEFAULT = "default",
  MORE = "more"
}
