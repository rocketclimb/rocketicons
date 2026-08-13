"use client";

import { IconFromData } from "@rocketicons/core";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { loadIconByComponent } from "@/catalog/client";
import type { StaticIconRecord } from "@/catalog/types";
import type { PropsWithLang } from "@/types";

const DocumentationQueryIcon = ({ lang }: PropsWithLang) => {
  const selected = useSearchParams().get("i");
  const [icon, setIcon] = useState<StaticIconRecord | null>();

  useEffect(() => {
    let active = true;
    const [collectionId, component] = selected?.split(".") ?? [];
    if (!collectionId || !component) {
      setIcon(undefined);
      return;
    }
    setIcon(undefined);
    loadIconByComponent(collectionId, component)
      .then((loaded) => active && setIcon(loaded ?? null))
      .catch(() => active && setIcon(null));
    return () => {
      active = false;
    };
  }, [selected]);

  if (!selected) return null;
  return (
    <aside className="mb-8 flex items-center gap-4 rounded-lg border border-surface-border p-4 dark:border-surface-border-dark">
      {icon ? (
        <IconFromData
          className="icon-secondary-medium-3xl dark:icon-secondary-3xl"
          iconTree={icon.iconTree}
          variant={icon.variant}
        />
      ) : (
        <span className="size-8 rounded bg-surface-medium" aria-hidden />
      )}
      <p className="text-sm text-primary-light dark:text-primary-dark" aria-live="polite">
        {icon === null
          ? lang === "pt-br"
            ? "O ícone selecionado não foi encontrado."
            : "The selected icon was not found."
          : lang === "pt-br"
            ? `Exemplos solicitados para ${selected}`
            : `Examples requested for ${selected}`}
      </p>
    </aside>
  );
};

export default DocumentationQueryIcon;
