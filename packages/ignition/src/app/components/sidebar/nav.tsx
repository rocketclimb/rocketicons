"use client";
import { PropsWithChildren, useState } from "react";
import UrlObserver from "@/components/url-observer";
import { useDisclosure } from "@/components/modal-context";

const Nav = ({ children }: PropsWithChildren) => {
  const [pathName, setPathName] = useState<string>();
  const [hash, setHash] = useState<string>("");
  const { isOpen, close } = useDisclosure();
  return (
    <nav data-current={`${pathName}${hash}`} className="text-sm">
      <UrlObserver
        onChanges={({ pathName, hash }) => {
          isOpen && close();
          setPathName(pathName);
          console.log("x", hash);
          setHash(hash);
        }}
      />
      {children}
    </nav>
  );
};

export default Nav;
