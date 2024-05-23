import { PropsWithLang } from "@/types";
import dynamic from "next/dynamic";
import { withLocale } from "@/locales";

export const MdxComponent = async ({ lang, slug }: PropsWithLang & { slug: string }) => {
  const { component } = withLocale(lang);
  const selectedDoc = component(slug);

  const DynamicMarkDownComponent = await dynamic(
    () => import(`@/locales/components/${selectedDoc?.filePath}`),
  );

  return (
    <div className="flex flex-row">
      <div className="flex-grow">{selectedDoc && <DynamicMarkDownComponent />}</div>
    </div>
  );
};
