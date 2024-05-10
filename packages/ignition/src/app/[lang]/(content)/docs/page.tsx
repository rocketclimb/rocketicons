import { withLocale } from "@/app/locales";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";

import { redirect } from "next/navigation";

const Page = ({ params: { lang } }: PropsWithLangSlugParams) => {
  const slug = "getting-started";
  const doc = withLocale(lang).doc(slug);

  redirect(`/${lang}/docs/${doc.slug}`);
};

export default Page;
