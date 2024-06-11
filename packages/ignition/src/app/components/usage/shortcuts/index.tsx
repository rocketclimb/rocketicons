import { PropsWithLang } from "@/types";
import { MdxPartial } from "@/components/mdx";
import { getCurrentIconData } from "@/components/usage/utils";
import GridContainer from "@/components/documentation/grid-container";

import { CodeSample } from "@rocketclimb/code-block";
import Wrapper from "@/components/documentation/wrapper";

const Shortcuts = ({ lang, queryIcon }: PropsWithLang & { queryIcon?: string }) => {
  const { icon, Icon } = getCurrentIconData(queryIcon);

  return (
    <>
      <MdxPartial lang={lang} slug="shortcuts" path="docs" />
      <div className="mx-auto mt-12 w-full max-w-xl lg:max-w-2xl">
        <GridContainer>
          <div className="mx-auto w-fit my-8">
            <Icon className="icon-sky-900-6xl dark:icon-sky-500-6xl" />
          </div>
        </GridContainer>
        <CodeSample>
          <div className="mx-auto w-fit my-8">
            <div data-cb-tag={icon} className="icon-sky-900-7xl dark:icon-sky-500-7xl" />
          </div>
        </CodeSample>
      </div>
      <Wrapper>
        <MdxPartial lang={lang} slug="shortcuts/shortcuts-explanation" path="docs" />
        <GridContainer>
          <div className="mx-auto w-fit my-8">
            <Icon className="icon-sky-900 icon-6xl dark:icon-sky-500 dark:icon-6xl" />
          </div>
        </GridContainer>
        <CodeSample>
          <div className="mx-auto w-fit my-8">
            <div
              data-cb-tag={icon}
              className="icon-sky-900 icon-6xl dark:icon-sky-500 dark:icon-6xl"
            />
          </div>
        </CodeSample>
      </Wrapper>
      <Wrapper>
        <MdxPartial lang={lang} slug="shortcuts/shortcuts-saving-time" path="docs" />
        <GridContainer>
          <div className="mx-auto w-fit my-8">
            <Icon className="icon-sky-900 icon-6xl dark:icon-sky-500-6xl" />
          </div>
        </GridContainer>
        <CodeSample>
          <div className="mx-auto w-fit my-8">
            <div data-cb-tag={icon} className="icon-sky-900 icon-6xl dark:icon-sky-500-6xl" />
          </div>
        </CodeSample>
      </Wrapper>
    </>
  );
};

export default Shortcuts;
