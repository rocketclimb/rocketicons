import { MDXContent } from "@content-collections/mdx/react";
import { PropsWithLangSlugParams } from "@/app/types/props-with-lang-slug-params";
import { allDocs } from "content-collections";

const Page = ({ params: { lang, slug } }: PropsWithLangSlugParams) => {
  // return (
  //   <>
  //     <p>{lang}</p>
  //     <p>{slug}</p>
  //   </>
  // );
  return (
    <div>
      <p>{lang}</p>
      <p>{slug}</p>
      <ul>
        {allDocs.map((doc) => (
          <li key={doc._meta.path}>
            <h3>{doc.title}</h3>
            <MDXContent code={doc.body} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
