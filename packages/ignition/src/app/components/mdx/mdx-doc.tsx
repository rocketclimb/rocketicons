import { PropsWithLang } from "@/types";
import dynamic from "next/dynamic";
import { useLocale } from "@/locales/use-locale";

export const MdxDoc = ({
  lang,
  slug,
}: PropsWithLang & { slug: string }) => {
  const { doc } = useLocale(lang);
  const selectedDoc = doc(slug);
  const DynamicMarkDownComponent = dynamic(
    () => import(`@/locales/docs/${selectedDoc?.filePath}`),
    {
      loading: () => <p>Loading...</p>,
    }
  );

  return (
    <div className="flex flex-row">
      <div className="flex-grow">
        {selectedDoc && <DynamicMarkDownComponent />}
      </div>
    </div>
  );
};
