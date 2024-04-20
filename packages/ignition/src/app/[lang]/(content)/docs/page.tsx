import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";

import { redirect } from "next/navigation";

const Page = ({ params: { lang } }: PropsWithLangSlugParams) =>
  redirect(`/${lang}/docs/getting-started`);

export default Page;
