import { PropsWithLang } from "@/types";
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { useLocale } from "@/app/locales";

export const MdxDoc = ({ lang, slug }: PropsWithLang & { slug: string }) => {
  const selectedDoc = useLocale(lang, slug).doc() as any;  

  // Redirect to the component section if the doc is a component
  if (selectedDoc && selectedDoc.isComponent) {
    redirect(`/${lang}/docs/${selectedDoc.group}#${slug}`)
  }

  const DynamicMarkDownComponent = dynamic(() => import(`../../locales/docs/${selectedDoc?._meta.filePath}`), {
    loading: () => <p>Loading...</p>,
  })

  return (
    <div className="flex flex-row">
      <div className="flex-grow">
        {selectedDoc && <DynamicMarkDownComponent />}
      </div>
      {/* <nav className="order-last hidden w-56 shrink-0 lg:block">
        right panel (insert TOC here)
      </nav> */}
    </div>
  );
};
