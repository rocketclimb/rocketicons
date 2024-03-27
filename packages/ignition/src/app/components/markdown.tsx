import ReactMarkdown from "react-markdown";

const Markdown = ({ className, children }: any) => (
  <ReactMarkdown
    className={className}
    components={{
      a: (props) => {
        const { node, ...rest } = props;
        return <a className="text-sky-500" {...rest} />;
      },
    }}
  >
    {children}
  </ReactMarkdown>
);

export default Markdown;
