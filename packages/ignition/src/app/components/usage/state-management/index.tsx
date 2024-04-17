import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import { getCurrentIconData } from "@/components/usage/utils";
import GridContainer from "@/components/documentation/grid-container";
import UpdateAlert from "@/components/documentation/update-alert";
import { RocketIconsTextDefault } from "@/components/rocketicons-text";
import { TbCheckbox, TbUserQuestion, TbUserStar, TbUser } from "rocketicons/tb";

import CodeSample from "@/components/code-block/code-sample";

const StateManagement = async ({
  lang,
  queryIcon,
}: PropsWithLang & { queryIcon?: string }) => {
  const { icon, Icon } = await getCurrentIconData(queryIcon);
  return (
    <>
      <MdxPartial lang={lang} slug={"styling"} path="docs" />
      <GridContainer>
        <div className="mx-auto w-32 my-8">
          <Icon className="size-32 border border-transparent rounded-xl hover:border-slate-600" />
        </div>
      </GridContainer>
      <UpdateAlert alert="hover" lang={lang} />
      <CodeSample>
        <div>
          <div
            data-tag={icon}
            className="size-32 border border-transparent rounded-xl hover:border-slate-600"
          />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent first:bg-white last:border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent first:bg-white last:border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent first:bg-white last:border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent first:bg-white last:border-slate-600" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div
            data-tag={icon}
            className="first:bg-white last:border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="first:bg-white last:border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="first:bg-white last:border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="first:bg-white last:border-slate-600 ..."
          />
        </div>
      </CodeSample>

      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-white odd:border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-white odd:border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-white odd:border-slate-600" />
          <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-white odd:border-slate-600" />
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <div
            data-tag={icon}
            className="even:bg-white odd:border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="even:bg-white odd:border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="even:bg-white odd:border-slate-600 ..."
          />
          <div
            data-tag={icon}
            className="even:bg-white odd:border-slate-600 ..."
          />
        </div>
      </CodeSample>
      <GridContainer>
        <div className="mx-auto flex justify-center gap-6 my-8">
          <a
            href="#"
            className="group/sample block max-w-xs mx-auto rounded-lg p-6 bg-white ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500"
          >
            <div className="flex items-center space-x-2">
              <Icon className="icon-sky-500 group-hover/sample:icon-white" />
              <RocketIconsTextDefault
                className="dark:text-slate-900 group-hover/sample:text-white"
                showIcon={false}
              />
            </div>
            <p className="text-slate-500 group-hover/sample:text-white text-sm">
              Group state can be used to change style of the icon.
            </p>
          </a>
        </div>
      </GridContainer>
      <UpdateAlert alert="hover" lang={lang} />
      <CodeSample>
        <div>
          <a href="#" className="group/sample ...">
            <div className="flex">
              <div
                data-tag={icon}
                className="icon-sky-500 group-hover/sample:icon-white"
              />
              <span className="dark:text-slate-900 font-quicksand group-hover/sample:text-white">
                <span>rocket</span>
                <span className="font-semibold">icons</span>
              </span>
            </div>
            <p className="text-slate-500 group-hover/sample:text-white text-sm">
              Group state can be used to change style of the icon.
            </p>
          </a>
        </div>
      </CodeSample>
      <GridContainer>
        <div className="relative max-w-xs mx-auto rounded-lg p-6 pb-4 bg-white my-8">
          <fieldset>
            <legend className="text-slate-400 pb-1.5 mb-3 pr-16 border-b border-slate-200 font-semibold">
              User permission
            </legend>
            <input
              id="admin"
              className="peer/admin size-4 opacity-0 -mr-6"
              type="radio"
              name="permission"
            />
            <TbCheckbox className="transition-opacity duration-200 pointer-events-none ml-2 opacity-40 -mt-0.5 icon-slate-400 peer-hover/admin:opacity-100 peer-checked/admin:opacity-90 peer-checked/admin:icon-sky-500" />
            <label
              htmlFor="admin"
              className="ml-2 peer-checked/admin:text-sky-500"
            >
              Admin
            </label>

            <input
              id="user"
              className="peer/user size-4 ml-10 opacity-0 -mr-6"
              type="radio"
              name="permission"
            />
            <TbCheckbox className="transition duration-200 pointer-events-none opacity-40 -mt-0.5 icon-slate-400  peer-hover/user:opacity-100 peer-checked/user:opacity-90 peer-checked/user:icon-sky-500" />
            <label
              htmlFor="user"
              className="ml-2 peer-checked/user:text-sky-500"
            >
              User
            </label>
            <TbUserQuestion className="transition duration-500 opacity-100 absolute block size-20 right-0 top-2 peer-checked/admin:opacity-0 peer-checked/user:opacity-0" />
            <TbUserStar className="transition duration-500 opacity-0 absolute block size-20 right-0 top-2 peer-checked/admin:opacity-100" />
            <TbUser className="transition duration-500 opacity-0 absolute block size-20 right-0 top-2 peer-checked/user:opacity-100" />
          </fieldset>
        </div>
      </GridContainer>
      <CodeSample>
        <div>
          <fieldset>
            <legend>User permission</legend>
            <input
              id="admin"
              className="peer/admin"
              type="radio"
              name="permission"
            />
            <div
              data-tag="TbCheckbox"
              className="transition ... peer-hover/admin:opacity-100 peer-checked/admin:opacity-90 peer-checked/admin:icon-sky-500"
            />
            <label
              htmlFor="admin"
              className="ml-2 peer-checked/admin:text-sky-500"
            >
              Admin
            </label>

            <input
              id="user"
              className="peer/user"
              type="radio"
              name="permission"
            />
            <div
              data-tag="TbCheckbox"
              className="transition ... peer-hover/user:opacity-100 peer-checked/user:opacity-90 peer-checked/user:icon-sky-500"
            />
            <label
              htmlFor="user"
              className="ml-2 peer-checked/user:text-sky-500"
            >
              User
            </label>
            <div
              data-tag="TbUserQuestion"
              className="transition opacity-100 ... peer-checked/admin:opacity-0 peer-checked/user:opacity-0"
            />
            <div
              data-tag="TbUserStar"
              className="transition opacity-0 ... peer-checked/admin:opacity-100"
            />
            <div
              data-tag="TbUser"
              className="transition opacity-0 ... peer-checked/user:opacity-100"
            />
          </fieldset>
        </div>
      </CodeSample>
    </>
  );
};

export default StateManagement;
