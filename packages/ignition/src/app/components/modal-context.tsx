"use client";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useId,
} from "react";

import useKeyboardShortcut from "@/hooks/use-keyboard-shortcut";

type ModalContentType = JSX.Element;

type AddModal = (Add: ModalContentType) => void;
type StateGenerator = (
  id: string
) => [state: boolean, (state: boolean) => void, AddModal];

const Context = createContext<StateGenerator>(() => [
  false,
  () => {},
  () => false,
]);

const useModalContext = () => useContext(Context);

const ModalContext = ({ children }: PropsWithChildren) => {
  const [opened, setOpened] = useState<string[]>([]);
  const [modals, setModals] = useState<Map<string, ModalContentType>>(
    new Map()
  );

  const setIndexState = (id: string, state: boolean) =>
    setOpened((ids) => {
      if (state) {
        !ids.includes(id) && ids.push(id);
      } else {
        const pos = ids.indexOf(id);
        pos > -1 && ids.splice(pos, 1);
      }
      return [...ids];
    });

  const generateState: StateGenerator = (id: string) => [
    opened.includes(id),
    (state: boolean) => setIndexState(id, state),
    (add: ModalContentType) => setModals((modals) => modals.set(id, add)),
  ];

  return (
    <Context.Provider value={generateState}>
      <ModalContent isOpen={!!opened.length} closeModal={() => setOpened([])}>
        {opened.map((id) => (
          <div className="fixed z-50" key={id}>
            {modals.get(id)!}
          </div>
        ))}
      </ModalContent>
      <div className="modal-context flex flex-col peer-data-[open=true]:blur-sm peer-data-[open=true]:backdrop-brightness-90 dark:peer-data-[open=true]:backdrop-brightness-50 peer-data-[open=true]:opacity-50 w-full">
        {children}
      </div>
    </Context.Provider>
  );
};

type ModalContentProps = PropsWithChildren & {
  closeModal: () => void;
  isOpen: boolean;
};

const ModalContent = ({ children, isOpen, closeModal }: ModalContentProps) => {
  useEffect(() => {
    const handleResize = () => closeModal();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useKeyboardShortcut(() => closeModal(), {
    code: "Escape",
  });

  return (
    <div
      data-open={isOpen}
      className="fixed z-50 inset-0 peer hidden modal-open data-[open=true]:block"
    >
      <div
        onClick={() => closeModal()}
        className="fixed z-40 w-full h-full"
      ></div>
      {children}
    </div>
  );
};

type ModalProps = {
  add: AddModal;
} & PropsWithChildren;

const Modal = ({ add, children }: ModalProps) => {
  useEffect(() => {
    add(<>{children}</>);
  }, []);
  return <></>;
};

export const useDisclosure = (id?: string) => {
  id = id ?? `disclousure-${useId()}`;
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
    Modal: ({ children }: PropsWithChildren) => (
      <Modal add={addModal}>{children}</Modal>
    ),
  };
};

export default ModalContext;
