"use client";

import { useLocale } from "@/locales";
import { Languages } from "@/types";
import { Modal, useDisclosure } from "@/components/modal-context";
import SearchAlgolia from "@/components/search/search-algolia";
import SearchBoxInnerContents from "@/components/search/search-box-inner-contents";
import Button from "@/components/button";
import { useRef, useEffect } from "react";

type SearchButtonProps = {
  lang: Languages;
};

const SearchButton = ({ lang }: SearchButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const search = useLocale(lang).config("search");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <>
      <Button onClick={() => onOpen()}>
        <SearchBoxInnerContents label={search["placeholder"]} />
      </Button>
      <Modal>
        <SearchAlgolia lang={lang} inputRef={inputRef} />
      </Modal>
    </>
  );
};

export default SearchButton;
