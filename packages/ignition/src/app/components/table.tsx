import { PropsWithChildren } from "react";

type LineProp = Record<string, string | undefined> & { comment?: string };

type TableLineProps = {
  attr: string;
  value?: string;
  comment?: string;
  props?: LineProp[];
};

type TableValueProps = {
  value: string;
  comment?: string;
};
const TableValue = ({ value, comment }: TableValueProps) => (
  <div>
    {value}
    {comment && <span className="text-indigo-400"> /* {comment} */</span>}{" "}
  </div>
);

type TablePropAsValueProps = {
  prop: LineProp;
};

const TablePropAsValue = ({
  prop: { comment, ...prop },
}: TablePropAsValueProps) => {
  const [value] = Object.entries(prop).map(([key, value]) => `${key}:${value}`);
  return <TableValue value={value} comment={comment} />;
};

export const TableLine = ({ attr, value, comment, props }: TableLineProps) => (
  <tr className="border-b border-slate-100 dark:border-slate-400/10">
    <td className="py-2 pr-2 font-mono font-medium text-xs leading-6 text-sky-500 whitespace-nowrap dark:text-sky-400">
      {attr}
    </td>
    <td className="py-2 pl-2 flex gap-4 font-mono text-xs leading-6 whitespace-pre text-indigo-600  dark:text-indigo-300">
      {value && <TableValue value={value} comment={comment} />}
      <div className="text-indigo-600/70  dark:text-indigo-300/70">
        {props?.map((prop, i) => (
          <TablePropAsValue key={i} prop={prop} />
        ))}
      </div>
    </td>
  </tr>
);

export const Table = ({ children }: PropsWithChildren) => (
  <div className="md:overflow-hidden md:hover:overflow-auto flex md:mx-0">
    <div className="flex-none min-w-full sm:px-6 md:px-0 max-h-96 lg:max-h-96">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
              <div className="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">
                Class
              </div>
            </th>
            <th className="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
              <div className="py-2 pl-2 border-b border-slate-200 dark:border-slate-400/20">
                Properties
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="align-baseline">{children}</tbody>
      </table>
      <div className="sticky bottom-0 h-px -mt-px bg-slate-200 dark:bg-slate-400/20"></div>
    </div>
  </div>
);
