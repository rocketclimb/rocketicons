"use client";
import Link from "next/link";
import { IoMdClose } from "rocket-bolt/io";
import { LuSearch } from "rocket-bolt/lu";
import { HiOutlineDotsVertical } from "rocket-bolt/hi";

import ThemeSelector from "@/components/theme-selector";

import { Modal, useDisclosure } from "@/app/components/modal-context";
import Button from "@/components/button";

import { PropsWithLang } from "@/types";

import { NavItem } from "./types";

type NavAsMenuProps = {
  navItems: NavItem[];
} & PropsWithLang;

const NavAsMenu = ({ navItems, lang }: NavAsMenuProps) => {
  const { onOpen, onClose } = useDisclosure();

  return (
    <div className="flex md:hidden">
      <LuSearch className="icon-slate-500 hover:icon-slate-700 dark:hover:icon-slate-400" />
      <Button className="flex" onClick={() => onOpen()}>
        <HiOutlineDotsVertical className="icon-slate-500 ml-6 hover:icon-slate-700 dark:hover:icon-slate-400" />
      </Button>
      <Modal>
        <div className="fixed top-4 right-4 w-full max-w-xs bg-white rounded-lg shadow-lg px-6 text-base font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:highlight-white/5">
          <nav>
            <Button
              onClick={() => onClose()}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center"
            >
              <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
            </Button>
            <ul className="mt-6">
              <ul>
                {navItems.map(({ label, link }, i) => (
                  <li className="mb-6" key={i}>
                    <Link className="hover:text-sky-500" href={link}>
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

export default NavAsMenu;
