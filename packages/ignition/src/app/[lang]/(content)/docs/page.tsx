import { withLocale } from "@/app/locales";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-and-slug-param";

import { redirect } from "next/navigation";

const Page = async (props: PropsWithLangSlugParams) => {
  const { lang } = (await props.params) as { lang: import("@/types").Languages; slug: string };

  const slug = "getting-started";
  const doc = withLocale(lang).doc(slug);

  redirect(`/${lang}/docs/${doc.slug}`);
};

export default Page;
