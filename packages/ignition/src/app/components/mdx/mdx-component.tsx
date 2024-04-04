import { PropsWithLang } from "@/types";
import dynamic from "next/dynamic";
import { useLocale } from "@/app/locales";

export const MdxComponent = ({
  lang,
  slug,
}: PropsWithLang & { slug: string }) => {
  const selectedDoc = useLocale(lang, slug).component();

  const DynamicMarkDownComponent = dynamic(
    () => import(`../../locales/components/${selectedDoc?._meta.filePath}`),
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
