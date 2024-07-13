import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";

import { getCurrentIconData } from "@/components/usage/utils";
import GridContainer from "@/components/documentation/grid-container";
import UpdateAlert from "@/components/documentation/update-alert";
import { RocketIconsTextDefault } from "@/components/rocketicons-text";
import { TbCheckbox, TbUserQuestion, TbUserStar, TbUser } from "rocketicons/tb";

import { CodeSample } from "@rocketclimb/code-block";
import Wrapper from "@/components/documentation/wrapper";

const StateManagement = ({ lang, queryIcon }: PropsWithLang & { queryIcon?: string }) => {
  const { icon, Icon } = getCurrentIconData(queryIcon);
  return (
    <>
      <MdxPartial lang={lang} slug={"state-management"} path="docs" />
      <GridContainer>
        <div className="mx-auto w-32 my-8">
          <Icon className="size-32 rounded-xl hover:border hover:border-primary-medium" />
        </div>
      </GridContainer>
      <UpdateAlert alert="hover" lang={lang} />
      <CodeSample>
        <div>
          <div
            data-cb-tag={icon}
            className="size-32 rounded-xl hover:border hover:border-primary-medium"
          />
        </div>
      </CodeSample>
      <Wrapper>
        <MdxPartial lang={lang} slug={"state-management/state-management-order"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl first:bg-background hover:border last:border-primary-medium" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl first:bg-background hover:border last:border-primary-medium" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl first:bg-background hover:border last:border-primary-medium" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl first:bg-background hover:border last:border-primary-medium" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div
              data-cb-tag={icon}
              className="first:bg-background last:border-primary-medium ..."
            />
            <div
              data-cb-tag={icon}
              className="first:bg-background last:border-primary-medium ..."
            />
            <div
              data-cb-tag={icon}
              className="first:bg-background last:border-primary-medium ..."
            />
            <div
              data-cb-tag={icon}
              className="first:bg-background last:border-primary-medium ..."
            />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug={"state-management/state-management-order-eo"} path="docs" />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-background odd:border-primary-medium" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-background odd:border-primary-medium" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-background odd:border-primary-medium" />
            <Icon className="size-16 md:size-20 lg:size-32 rounded-xl border border-transparent even:bg-background odd:border-primary-medium" />
          </div>
        </GridContainer>
        <CodeSample>
          <div>
            <div
              data-cb-tag={icon}
              className="even:bg-background odd:border-primary-medium ..."
            />
            <div
              data-cb-tag={icon}
              className="even:bg-background odd:border-primary-medium ..."
            />
            <div
              data-cb-tag={icon}
              className="even:bg-background odd:border-primary-medium ..."
            />
            <div
              data-cb-tag={icon}
              className="even:bg-background odd:border-primary-medium ..."
            />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial
          lang={lang}
          slug={"state-management/state-management-group-state"}
          path="docs"
        />
        <GridContainer>
          <div className="mx-auto flex justify-center gap-6 my-8">
            <button className="group/sample block max-w-xs mx-auto rounded-lg p-6 bg-background ring-1 ring-primary/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500">
              <div className="flex items-center space-x-2">
                <Icon className="icon-sky-500 group-hover/sample:icon-white" />
                <RocketIconsTextDefault
                  className="dark:text-primary group-hover/sample:text-white"
                  showIcon={false}
                />
              </div>
              <p className="text-primary-light group-hover/sample:text-primary-dark text-sm">
                Group state can be used to change style of the icon.
              </p>
            </button>
          </div>
        </GridContainer>
        <UpdateAlert alert="hover" lang={lang} />
        <CodeSample>
          <div>
            <button className="group/sample ...">
              <div className="flex">
                <div data-cb-tag={icon} className="icon-sky-500 group-hover/sample:icon-white" />
                <span className="dark:text-primary font-quicksand group-hover/sample:text-primary-dark">
                  <span>rocket</span>
                  <span className="font-semibold">icons</span>
                </span>
              </div>
              <p className="text-primary-light group-hover/sample:text-primary-dark text-sm">
                Group state can be used to change style of the icon.
              </p>
            </button>
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial
          lang={lang}
          slug={"state-management/state-management-peer-state"}
          path="docs"
        />
        <GridContainer>
          <div className="relative max-w-xs mx-auto rounded-lg p-6 pb-4 bg-background my-8">
            <fieldset>
              <legend className="text-primary-lighter pb-1.5 mb-3 pr-16 border-b border-surface-border font-semibold">
                User permission
              </legend>
              <input
                id="admin"
                className="peer/admin size-4 opacity-0 -mr-6"
                type="radio"
                name="permission"
              />
              <TbCheckbox className="transition-opacity duration-200 pointer-events-none ml-2 opacity-40 -mt-0.5 icon-primary-lighter peer-hover/admin:opacity-100 peer-checked/admin:opacity-90 peer-checked/admin:icon-sky-500" />
              <label htmlFor="admin" className="ml-2 peer-checked/admin:text-sky-500">
                Admin
              </label>

              <input
                id="user"
                className="peer/user size-4 ml-10 opacity-0 -mr-6"
                type="radio"
                name="permission"
              />
              <TbCheckbox className="transition duration-200 pointer-events-none opacity-40 -mt-0.5 icon-primary-lighter peer-hover/user:opacity-100 peer-checked/user:opacity-90 peer-checked/user:icon-sky-500" />
              <label htmlFor="user" className="ml-2 peer-checked/user:text-sky-500">
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
              <input id="admin" className="peer/admin" type="radio" name="permission" />
              <div
                data-cb-tag="TbCheckbox"
                className="transition ... peer-hover/admin:opacity-100 peer-checked/admin:opacity-90 peer-checked/admin:icon-sky-500"
              />
              <label htmlFor="admin" className="ml-2 peer-checked/admin:text-sky-500">
                Admin
              </label>

              <input id="user" className="peer/user" type="radio" name="permission" />
              <div
                data-cb-tag="TbCheckbox"
                className="transition ... peer-hover/user:opacity-100 peer-checked/user:opacity-90 peer-checked/user:icon-sky-500"
              />
              <label htmlFor="user" className="ml-2 peer-checked/user:text-sky-500">
                User
              </label>
              <div
                data-cb-tag="TbUserQuestion"
                className="transition opacity-100 ... peer-checked/admin:opacity-0 peer-checked/user:opacity-0"
              />
              <div
                data-cb-tag="TbUserStar"
                className="transition opacity-0 ... peer-checked/admin:opacity-100"
              />
              <div
                data-cb-tag="TbUser"
                className="transition opacity-0 ... peer-checked/user:opacity-100"
              />
            </fieldset>
          </div>
        </CodeSample>
      </Wrapper>
    </>
  );
};

export default StateManagement;
