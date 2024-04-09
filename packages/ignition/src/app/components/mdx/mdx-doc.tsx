import { PropsWithLang } from "@/types";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { useLocale } from "@/app/locales";

export const MdxDoc = ({
  lang,
  slug,
  icon,
}: PropsWithLang & { slug: string; icon?: string }) => {
  const selectedDoc = useLocale(lang, slug).docFromIndex();
  if (slug != selectedDoc.slug) {
    redirect(
      `/${lang}/docs/${selectedDoc.slug}${(icon && "?i=" + icon) || ""}`
    );
  }

  // Redirect to the component section if the doc is a component
  if (selectedDoc && selectedDoc.isComponent) {
    redirect(`/${lang}/docs/${selectedDoc.group}#${slug}`);
  }

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
