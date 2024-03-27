"use client";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type ModalContentType = JSX.Element;

type SetHasOpen = (state: boolean) => void;
type AddModal = (Add: ModalContentType) => void;

const Context = createContext<[SetHasOpen, AddModal]>([() => {}, () => {}]);

const useModalContext = () => useContext(Context);

const ModalContext = ({ children }: PropsWithChildren) => {
  const [hasOpen, setHasOpen] = useState<boolean>(false);
  const [modals, setModals] = useState<ModalContentType[]>([]);

  const addModal = (add: ModalContentType) =>
    setModals((modals) => [...modals, add]);

  return (
    <Context.Provider value={[(state: boolean) => setHasOpen(state), addModal]}>
      {hasOpen && modals.map((modal, i) => <div key={i}>{modal}</div>)}
      <div className={`${(hasOpen && "blur-sm md:blur-none") || ""} w-full`}>
        {children}
      </div>
    </Context.Provider>
  );
};

export const useDisclosure = () => {
  const [setHasOpen] = useModalContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const update = (state: boolean) => {
    setIsOpen(state);
    setHasOpen(state);
  };
  return { isOpen, onOpen: () => update(true), onClose: () => update(false) };
};

export const Modal = ({ children }: PropsWithChildren) => {
  const [, addModal] = useModalContext();
  useEffect(() => {
    addModal(<div className="fixed z-50 inset-0 md:hidden">{children}</div>);
  }, []);
  return <></>;
};

export default ModalContext;
