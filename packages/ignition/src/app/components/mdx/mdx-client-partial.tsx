import { MdxPartial, MdxPartialProps } from "./mdx-partial";

export const MdxClientPartial = (props: MdxPartialProps) => (
  <MdxPartial {...props} deps={[props.lang]} />
);
