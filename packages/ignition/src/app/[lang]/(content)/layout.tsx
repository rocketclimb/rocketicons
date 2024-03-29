"use client";

import Button from "@/app/components/button";
import { IconsManifest } from "rocketicons/core/icons-manifest";
import Link from "next/link";
import { PropsWithChildrenAndLangParams } from "@/types";
import { useState } from "react";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="flex flex-col grow">
      <div className="sticky top-[64px] z-10 border-b border-slate-800 px-4 py-3 backdrop-blur-sm  md:hidden">
        <div className="flex flex-col justify-between">
          <Button
            className="flex items-center gap-1"
            type="button"
            onClick={toggleMenu}
          >
            <svg
              fill="none"
              height="24"
              shapeRendering="geometricPrecision"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M9 18l6-6-6-6"></path>
            </svg>{" "}
            <span>Menu</span>
          </Button>
          <>{menuOpen && <div className="h-screen w-full">menu content</div>}</>
        </div>
      </div>
      <div className="relative mx-auto max-w-screen-xl px-4 py-10 md:flex md:flex-row md:py-10">
        <div className="hidden h-[calc(100vh-121px)] w-[284px] md:flex md:shrink-0 md:flex-col md:justify-between">
          <div className="relative overflow-hidden">
            <nav>
              <ul>
                <li>
                  <h5 className="mb-8 lg:mb-3 font-semibold text-slate-900 dark:text-slate-200">
                    Icons
                  </h5>
                  <ul className="space-y-6 lg:space-y-2 border-l border-slate-100 dark:border-slate-800">
                    {IconsManifest.map(({ id, name }, i) => (
                      <li key={i}>
                        <Link
                          className="block border-l pl-4 -ml-px border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
                          href={`/icons/${id}`}
                        >
                          {(name === "rocketclimb" && (
                            <>
                              <span className="font-light">rocket</span>
                              <span className="font-semibold">icons</span>
                            </>
                          )) ||
                            name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <nav className="order-last hidden w-56 shrink-0 lg:block">
          right panel
        </nav>
        <article className="mt-4 w-full min-w-0 max-w-6xl px-1 md:px-6">
          center panel
          {children}
        </article>
      </div>
      <div className="relative mx-auto max-w-screen-xl px-4 py-10 md:flex md:flex-row md:py-10">
        footer
      </div>
    </div>
  );
};

export default Layout;
