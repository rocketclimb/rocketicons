"use client";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useId,
} from "react";

type ModalContentType = JSX.Element;

type StateGenerator = (id: string) => (state: boolean) => void;
type AddModal = (Add: ModalContentType) => void;

const Context = createContext<[StateGenerator, AddModal]>([
  () => () => {},
  () => {},
]);

const useModalContext = () => useContext(Context);

const ModalContext = ({ children }: PropsWithChildren) => {
  const indexRef = useRef<Record<string, number>>({});

  const [opened, setOpened] = useState<number[]>([]);
  const [modals, setModals] = useState<ModalContentType[]>([]);

  const setIndexState = (index: number, state: boolean) =>
    setOpened((indexes) => {
      if (state) {
        !indexes.includes(index) && indexes.push(index);
      } else {
        const pos = indexes.indexOf(index);
        pos > -1 && indexes.splice(pos, 1);
      }
      return [...indexes];
    });

  const addModal = (add: ModalContentType) =>
    setModals((modals) => [...modals, add]);

  const generateState = (id: string): ((state: boolean) => void) => {
    if (indexRef.current[id] === undefined) {
      indexRef.current[id] = Object.keys(indexRef.current).length;
    }
    return (state: boolean) => setIndexState(indexRef.current[id], state);
  };

  return (
    <Context.Provider value={[(id: string) => generateState(id), addModal]}>
      {opened.length > 0 &&
        modals
          .filter((_, index) => opened.includes(index))
          .map((modal, i) => (
            <ModalContent key={i} closeModal={() => setOpened([])}>
              {modal}
            </ModalContent>
          ))}
      <div className="modal-context flex flex-col peer-[.modal-open]:blur-sm peer-[.modal-open]:backdrop-brightness-90 dark:peer-[.modal-open]:backdrop-brightness-50 peer-[.modal-open]:opacity-50 w-full">
        {children}
      </div>
    </Context.Provider>
  );
};

type ModalContentProps = PropsWithChildren & {
  closeModal: () => void;
};

const ModalContent = ({ children, closeModal }: ModalContentProps) => {
  useEffect(() => {
    const handleResize = () => closeModal();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed z-50 inset-0 peer modal-open">
      <div
        onClick={() => closeModal()}
        className="fixed z-40 w-full h-full"
      ></div>
      {children}
    </div>
  );
};

export const useDisclosure = () => {
  const id = `disclousure-${useId()}`;
  const [generator] = useModalContext();
  const setState = generator(id);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
    setState(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setState(false);
  }, []);

  return { isOpen, onOpen, onClose };
};

export const Modal = ({ children }: PropsWithChildren) => {
  const [, addModal] = useModalContext();
  useEffect(() => {
    addModal(<div className="fixed z-50">{children}</div>);
  }, []);
  return <></>;
};

export default ModalContext;
