import { PropsWithLang } from "@/types";
import dynamic from "next/dynamic";
import { withLocale } from "@/app/locales";

export const MdxComponent = ({ lang, slug }: PropsWithLang & { slug: string }) => {
  const { component } = withLocale(lang);
  const selectedDoc = component(slug);

  const DynamicMarkDownComponent = dynamic(
    () => import(`@/locales/components/${selectedDoc?.filePath}`),
    {
      loading: () => <p>Loading...</p>
    }
  );

  return (
    <div className="flex flex-row">
      <div className="flex-grow">{selectedDoc && <DynamicMarkDownComponent />}</div>
    </div>
  );
};
