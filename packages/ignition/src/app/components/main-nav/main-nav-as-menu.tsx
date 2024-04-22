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
    <div className="flex lg:hidden">
      <Button className="flex" onClick={() => openSearch()}>
        <LuSearch className="icon-slate-500 hover:icon-slate-700 dark:hover:icon-slate-400" />
      </Button>
      <Button className="flex" onClick={() => open()}>
        <HiOutlineDotsVertical className="icon-slate-500 ml-6 hover:icon-slate-700 dark:hover:icon-slate-400" />
      </Button>
      <Modal>
        <div className="fixed top-4 right-4 w-72 max-w-xs bg-white rounded-lg shadow-lg px-6 text-base font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:highlight-white/5">
          <nav>
            <Button
              onClick={() => close()}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center"
            >
              <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
            </Button>
            <ul className="mt-6">
              <ul>
                {navItems.map(({ label, link }, i) => (
                  <li className="mb-6" key={i}>
                    <Link
                      className="hover:text-sky-500"
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
