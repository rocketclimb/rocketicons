import { PropsWithLang } from "@/types";
import dynamic from "next/dynamic";
import { useLocale } from "@/app/locales";

export const MdxPartial = ({
  lang,
  slug,
  path,
}: PropsWithLang & { slug: string; path: string }) => {
  const selectedDoc = useLocale(lang, slug, true).docFromIndex();

  path = path.endsWith("/") ? path : `${path}/`;

  const DynamicMarkDownComponent = dynamic(
    () => import(`@/locales/${path}${selectedDoc?.filePath}`),
    {
      loading: () => <p>Loading...</p>,
    }
  );

  return <>{selectedDoc && <DynamicMarkDownComponent />}</>;
};
