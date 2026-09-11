import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "@jest/globals";

import { buildContextArtifacts, loadContextSource, validateContextSource } from "./core";
import type { ContextSourceIcon } from "./types";

const collections: Array<[string, number, number]> = [
  ["rc", 1, 1],
  ["ti", 237, 336],
  ["tfi", 300, 352],
  ["vsc", 632, 653],
  ["hi", 226, 460],
  ["im", 491, 491],
  ["gr", 628, 637],
  ["cg", 682, 704]
];

const sources = new Map(collections.map(([id]) => [id, loadContextSource(id)!]));

describe("reviewed collections reaching half of the catalog", () => {
  test.each(collections)(
    "%s has complete metadata bound to the current glyphs",
    (id, families, total) => {
      const source = sources.get(id)!;
      expect(source).toBeDefined();
      validateContextSource(source);
      expect(source.families).toHaveLength(families);
      const manifest = require(resolve(`../icons/${id}/manifest.js`)).manifest;
      const icons: ContextSourceIcon[] = Object.values(manifest.icons).map((value) => {
        const entry = value as { id: string; name: string; compName: string; variant: string };
        return {
          id: entry.id,
          name: entry.name,
          component: entry.compName,
          variant: entry.variant,
          iconTree: JSON.parse(
            readFileSync(resolve(`../generator/svgs/${id}/${entry.id}.json`), "utf8")
          ).iconTree
        };
      });
      const result = buildContextArtifacts(id, "test", icons, source);
      expect(result.index.coverage).toEqual({
        total,
        enriched: total,
        missing: 0,
        stale: 0,
        orphaned: 0,
        complete: true
      });
    }
  );

  const queries: Array<[string, string, string, string]> = [
    ["vsc", "agent", "coding agent", "agente de programação"],
    ["vsc", "git-stash-apply", "apply stash", "aplicar stash"],
    ["vsc", "git-stash-pop", "pop stash", "recuperar stash"],
    ["vsc", "copilot-error", "Copilot error", "erro do Copilot"],
    ["vsc", "chat-sparkle", "AI chat", "conversa com IA"],
    ["vsc", "mic-off", "mute microphone", "silenciar microfone"],
    ["vsc", "twitter", "X", "X"],
    ["gr", "genai", "generative AI", "IA generativa"],
    ["gr", "genaifill", "generate content", "gerar conteúdo"],
    ["rc", "rocket-icon", "icon library", "biblioteca de ícones"],
    ["ti", "trash", "delete", "excluir"],
    ["ti", "arrow-left", "previous item", "item anterior"],
    ["ti", "warning", "warning", "aviso"],
    ["ti", "social-github", "GitHub logo", "Logotipo do GitHub"],
    ["tfi", "support", "first aid", "primeiros socorros"],
    ["tfi", "cup", "award", "prêmio"],
    ["tfi", "server", "database", "banco de dados"],
    ["tfi", "google", "Google+ logo", "Logotipo do Google+"],
    ["vsc", "debug-step-into", "enter function", "entrar na função"],
    [
      "vsc",
      "debug-breakpoint-conditional-unverified",
      "pending debugger binding",
      "vínculo pendente no depurador"
    ],
    ["vsc", "library", "documentation", "documentação"],
    ["vsc", "error", "failure", "falha"],
    ["hi", "save", "persist changes", "guardar alterações"],
    ["hi", "volume-off", "mute", "silenciar"],
    ["hi", "exclamation", "warning", "aviso"],
    ["im", "tree", "organization chart", "organograma"],
    ["im", "power", "electricity", "eletricidade"],
    ["im", "google", "search service", "serviço de busca"],
    ["gr", "sans", "storage area network", "rede de área de armazenamento"],
    ["gr", "tree", "hierarchy", "hierarquia"],
    ["gr", "info", "idea", "ideia"],
    ["gr", "zoom", "Zoom", "Zoom"],
    ["gr", "time", "signal measurement", "medição de sinal"],
    ["gr", "toast", "breakfast", "café da manhã"],
    ["cg", "ghost", "Ghost", "Ghost"],
    ["cg", "ghost-character", "Halloween", "Dia das Bruxas"],
    ["cg", "unfold", "Unfold", "Unfold"],
    ["cg", "format-strike", "strikethrough", "tachado"],
    ["cg", "arrow-left", "go back", "voltar"],
    ["cg", "toggle-off", "disabled setting", "configuração desativada"]
  ];

  test.each(queries)(
    "%s/%s supports its reviewed English and Portuguese intents",
    (id, familyId, en, pt) => {
      const source = loadContextSource(id)!;
      const family = source.families.find((entry) => entry.familyId === familyId)!;
      expect([...family.aliases.en, ...family.searchTerms.en]).toContain(en);
      expect([...family.aliases["pt-BR"], ...family.searchTerms["pt-BR"]]).toContain(pt);
    }
  );

  test.each([
    ["vsc", "git-stash-apply", "remove stash"],
    ["vsc", "git-stash-pop", "keep stash entry"],
    ["vsc", "copilot-error", "Copilot success"],
    ["rc", "rocket-icon", "rocket launch"],
    ["tfi", "support", "lifebuoy"],
    ["tfi", "cup", "coffee cup"],
    ["im", "power", "power button"],
    ["im", "tree", "forest"],
    ["gr", "sans", "sans-serif font"],
    ["gr", "zoom", "magnifying glass"],
    ["cg", "ghost", "ghost character"],
    ["cg", "unfold", "unfold code"]
  ])("%s/%s keeps misleading intent %s out of positive metadata", (id, familyId, negative) => {
    const family = loadContextSource(id)!.families.find((entry) => entry.familyId === familyId)!;
    expect(family.negativeTerms.en).toContain(negative);
    expect([...family.aliases.en, ...family.searchTerms.en]).not.toContain(negative);
  });
});
