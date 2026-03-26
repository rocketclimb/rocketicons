"use client";
import Link from "next/link";
import { IoMdClose } from "rocketicons/io";
import { LuSearch } from "rocketicons/lu";
import { HiOutlineDotsVertical } from "rocketicons/hi";

import ThemeSelector from "@/components/theme/theme-selector";

import { useDisclosure } from "@/components/modal-context";
import Button from "@/components/button";

import { PropsWithLang } from "@/types";

import { NavItem } from "./types";

type NavAsMenuProps = {
  navItems: NavItem[];
} & PropsWithLang;

const MainNavAsMenu = ({ navItems, lang }: NavAsMenuProps) => {
  const { open, close, Modal } = useDisclosure();
  const { open: openSearch } = useDisclosure("search-disclosure");

  return (
    <div className="flex col-span-2 landingpage:col-span-5 md:grow justify-self-end md:justify-end lg:hidden">
      <Button className="flex" onClick={() => openSearch()}>
        <LuSearch className="icon-primary-light hover:icon-primary-medium dark:hover:icon-primary-lighter" />
      </Button>
      <Button className="flex" onClick={() => open()}>
        <HiOutlineDotsVertical className="icon-primary-light ml-2 xs:ml-4 sm:ml-6 hover:icon-primary-medium dark:hover:icon-primary-lighter" />
      </Button>
      <Modal>
        <div className="fixed top-4 right-4 w-64 max-w-xs bg-background rounded-lg shadow-lg px-5 text-base font-semibold text-primary dark:bg-surface-dark dark:text-primary-lighter dark:highlight-background/5">
          <nav>
            <Button
              onClick={() => close()}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center"
            >
              <IoMdClose className="icon-primary-light hover:icon-primary-medium dark:icon-primary-lighter dark:hover:icon-primary-bright" />
            </Button>
            <ul className="mt-6">
              <ul>
                {navItems.map(({ label, link }, i) => (
                  <li className="mb-6" key={i}>
                    <Link
                      className="hover:text-secondary text-sm"
                      href={link}
                      onClick={() => close()}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </ul>
            <ThemeSelector lang={lang} />
          </nav>
        </div>
      </Modal>
    </div>
  );
};

export default MainNavAsMenu;
