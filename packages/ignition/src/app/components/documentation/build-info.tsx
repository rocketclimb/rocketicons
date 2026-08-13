import iconsPackage from "../../../../../icons/package.json";
import { DOCUMENTATION_UPDATED_AT } from "@/config/product-content";

import type { Languages } from "@/types";

const labels = {
  en: {
    catalog: "Catalog version",
    updated: "Content updated"
  },
  "pt-br": {
    catalog: "Versão do catálogo",
    updated: "Conteúdo atualizado"
  }
} satisfies Record<Languages, { catalog: string; updated: string }>;

const BuildInfo = ({ lang }: { lang: Languages }) => {
  const label = labels[lang];

  return (
    <p className="mt-8 text-sm text-on-surface-light/70 dark:text-on-surface-dark/70">
      {label.catalog}: <code>{iconsPackage.version}</code> · {label.updated}:{" "}
      {DOCUMENTATION_UPDATED_AT}
    </p>
  );
};

export default BuildInfo;
