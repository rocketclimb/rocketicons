import { PropsWithChildren } from "react";
import { Languages } from "@/types";
import { withLocale } from "@/locales";

type LineProp = Record<string, string | undefined> & { comment?: string };

type TableLineProps = {
  attr: string;
  value?: string;
  comment?: string;
  props?: LineProp[];
  aditional?: JSX.Element;
};

type TableValueProps = {
  value: string;
  comment?: string;
};
const TableValue = ({ value, comment }: TableValueProps) => (
  <div>
    <span>{value}</span>
    {comment && <span className="text-indigo-400"> {`/* ${comment} */`}</span>}
  </div>
);

type TablePropAsValueProps = {
  prop: LineProp;
};

const TablePropAsValue = ({ prop: { comment, ...prop } }: TablePropAsValueProps) => {
  const [value] = Object.entries(prop).map(([key, value]) => `${key}:${value}`);
  return <TableValue value={value} comment={comment} />;
};

export const TableLine = ({ attr, value, comment, props, aditional }: TableLineProps) => (
  <tr className="border-b border-surface-border dark:border-surface-border-lighter/10">
    <td className="py-2 pr-0.5 md:pr-2 font-mono font-medium text-[0.6rem] xs:text-[0.68rem] md:text-xs leading-6 text-secondary whitespace-nowrap dark:text-secondary-lighter">
      {attr}
    </td>
    <td className="py-2 pl-0.5 md:pl-2 flex gap-4 font-mono text-[0.6rem] xs:text-[0.68rem] md:text-xs leading-6 whitespace-pre text-indigo-600  dark:text-indigo-300">
      {value && <TableValue value={value} comment={comment} />}
      <div className="text-indigo-600/70  dark:text-indigo-300/70">
        {props?.map((prop, i) => <TablePropAsValue key={i} prop={prop} />)}
      </div>
    </td>
    {aditional && (
      <td className="py-2 pl-0.5 md:pl-2 leading-6 text-indigo-600 dark:text-indigo-300">
        {aditional}
      </td>
    )}
  </tr>
);

const Th = ({ children }: PropsWithChildren) => (
  <th className="sticky z-10 top-0 text-xs md:text-sm leading-6 font-semibold text-primary-darken bg-background p-0 dark:bg-background-dark dark:text-primary-bright">
    <div className="py-2 pr-2 border-b border-surface-border dark:border-surface-border-lighter/20">
      {children || <>&nbsp;</>}
    </div>
  </th>
);

type TableProps = {
  lang: Languages;
  hasAdditional?: boolean;
  collapse?: boolean;
} & PropsWithChildren;

export const Table = ({ lang, hasAdditional, collapse, children }: TableProps) => {
  const {
    headers: [header1, header2],
    "show-all": showAll,
    "show-fewer": showFewer
  } = withLocale(lang).config("table");

  return (
    <div data-collapse={collapse} className="group/table collapse-table">
      <div className="min-w-full sm:px-6 md:px-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <Th>{header1}</Th>
              <Th>{header2}</Th>
              {hasAdditional && <Th />}
            </tr>
          </thead>
          <tbody className="align-baseline">{children}</tbody>
        </table>
      </div>
      <div className="hidden group-data-[collapse=true]/table:max-lg:block text-center backdrop-opacity-90 bg-background/50 dark:bg-background-dark/75 -mt-8 has-[:checked]:mt-0 has-[:checked]:sticky has-[:checked]:bottom-0 py-1.5">
        <div className="text-sm py-1 dark:py-1.5 px-4 cursor-pointer dark:text-primary-dark/95 dark:ring-1 ring-primary-dark/25 dark:ring-inset font-semibold inline-block border rounded-xl bg-background dark:bg-background-dark border-surface-border dark:border-surface-light/10">
          <input id="show-all" className="w-0 invisible" type="checkbox" name="show-all" />
          <label htmlFor="show-all" className="cursor-pointer">
            <span className="showing-all capitalize">{showAll}</span>
            <span className="showing-fewer capitalize">{showFewer}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
