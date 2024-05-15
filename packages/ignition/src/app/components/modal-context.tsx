"use client";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useId
} from "react";
import useKeyboardShortcut from "@/hooks/use-keyboard-shortcut";

import UrlObserver from "./url-observer";

type ModalContentType = JSX.Element;

type AddModal = (Add: ModalContentType, ignoringResize?: boolean) => void;
type StateGenerator = (id: string) => [state: boolean, (state: boolean) => void, AddModal];

const Context = createContext<StateGenerator>(() => [false, () => {}, () => false]);

const useModalContext = () => useContext(Context);

const ModalContext = ({ children }: PropsWithChildren) => {
  const [opened, setOpened] = useState<string[]>([]);
  const [ignoringResize, setIgnoringResize] = useState<Set<string>>(new Set());
  const [modals, setModals] = useState<Map<string, ModalContentType>>(new Map());

  const setModalState = (id: string, state: boolean) =>
    setOpened((ids) => {
      if (state) {
        !ids.includes(id) && ids.push(id);
      } else {
        const pos = ids.indexOf(id);
        pos > -1 && ids.splice(pos, 1);
      }
      return [...ids];
    });

  const generateState: StateGenerator = useCallback(
    (id: string) => [
      opened.includes(id),
      (state) => setModalState(id, state),
      (add, ignoreResize) => {
        setModals((modals) => modals.set(id, add));
        ignoreResize && setIgnoringResize((ignoring) => ignoring.add(id));
      }
    ],
    []
  );

  return (
    <Context.Provider value={generateState}>
      <ModalContent
        isOpen={!!opened.length}
        closeModal={(isResizing) =>
          setOpened((opened) =>
            !isResizing ? [] : [...opened.filter((id) => ignoringResize.has(id))]
          )
        }
      >
        {opened.map((id) => (
          <div className="fixed z-50" key={id}>
            {modals.get(id)!}
          </div>
        ))}
      </ModalContent>
      <div className="transition-opacity duration-300 opacity-100 modal-context lg:flex lg:flex-col peer-data-[open=true]:blur-sm peer-data-[open=true]:backdrop-brightness-90 dark:peer-data-[open=true]:backdrop-brightness-50 peer-data-[open=true]:opacity-50 w-full">
        {children}
      </div>
    </Context.Provider>
  );
};

type ModalContentProps = PropsWithChildren & {
  closeModal: (isResizing?: boolean) => void;
  isOpen: boolean;
};

const ModalContent = ({ children, isOpen, closeModal }: ModalContentProps) => {
  useEffect(() => {
    const handleResize = () => closeModal(true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useKeyboardShortcut(() => closeModal(), {
    code: "Escape"
  });

  return (
    <>
      <UrlObserver onChanges={() => closeModal()} />
      <div
        data-open={isOpen}
        className="fixed z-50 inset-0 peer hidden modal-open data-[open=true]:block"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => closeModal()}
          className="fixed z-40 w-full h-full"
        ></div>
        {children}
      </div>
    </>
  );
};

type ModalOptionsProps = {
  keepOnResize?: boolean;
} & PropsWithChildren;

type ModalProps = {
  add: AddModal;
} & ModalOptionsProps;

const Modal = ({ add, keepOnResize, children }: ModalProps) => {
  useEffect(() => {
    add(<>{children}</>, keepOnResize);
  }, []);
  return <></>;
};

export const useDisclosure = (id?: string) => {
  const generatedId = useId();
  id = id ?? `disclousure-${generatedId}`;
  const generator = useModalContext();
  const [isOpen, setState, addModal] = generator(id);

  const open = useCallback(() => {
    setState(true);
  }, []);

  const close = useCallback(() => {
    setState(false);
  }, []);

  return {
    isOpen,
    open,
    close,
    Modal: ({ keepOnResize, children }: ModalOptionsProps) => (
      <Modal keepOnResize={keepOnResize} add={addModal}>
        {children}
      </Modal>
    )
  };
};

export default ModalContext;
