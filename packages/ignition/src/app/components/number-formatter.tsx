import { PropsWithLang } from "@/types";

type NumberFormatterProps = {
  number: number;
} & PropsWithLang;

const NumberFormatter = ({ lang, number }: NumberFormatterProps) => (
  <>{new Intl.NumberFormat(lang).format(number)}</>
);

export default NumberFormatter;
