import { getCollection, iconSummary, requireIcon } from "./catalog";
import { iconUsage, inspectProject } from "./project";
import { matchIconIntent, searchIcons, SearchResponse, SearchResult } from "./search";

type RecommendInput = {
  projectPath: string;
  intent: string;
  limit?: number;
  fromFile?: string;
};
type Search = (_input: {
  query: string;
  collections?: string[];
  limit: number;
}) => Promise<SearchResponse>;

const usage = (id: string, language: "ts" | "js", projectPath: string, fromFile?: string) => {
  const compact = (target: "react" | "react-native") => {
    const { generatedPath, importStatement, importHint, example } = iconUsage(
      id,
      target,
      language,
      fromFile ? { projectPath, fromFile } : undefined
    );
    return { generatedPath, importStatement, importHint, example };
  };
  return { web: compact("react"), reactNative: compact("react-native") };
};

export const recommendIcons = async (
  { projectPath, intent, limit = 5, fromFile }: RecommendInput,
  search: Search = searchIcons
) => {
  if (!intent.trim()) throw new Error("intent must describe the icon you need");
  if (!Number.isInteger(limit) || limit < 1 || limit > 10)
    throw new Error("limit must be an integer from 1 to 10");

  const project = inspectProject(projectPath);
  const installed = project.manifest?.icons ?? {};
  const managedIds = Object.keys(installed);
  const installedIds = new Set(
    managedIds.filter((id) => project.installedIconStatus[id] !== "missing")
  );
  const language = project.manifest?.language ?? project.detectedLanguage;
  const target = project.manifest?.target ?? project.detectedTarget;
  const counts = new Map<string, number>();
  for (const id of installedIds) {
    const collection = installed[id].collection;
    counts.set(collection, (counts.get(collection) ?? 0) + 1);
  }
  const installedCollections = [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, count]) => ({ id, name: getCollection(id)!.name, count }));
  const collections = installedCollections.map(({ id }) => id);

  const reuseCandidates: SearchResult[] = [...installedIds]
    .map((id) => {
      const icon = requireIcon(id);
      const evidence = matchIconIntent(icon, intent);
      return { icon, ...evidence };
    })
    .filter(({ score, misleading }) => score >= 50 && !misleading)
    .sort((a, b) => b.score - a.score || a.icon.id.localeCompare(b.icon.id))
    .map(({ icon, reason }) => ({ ...iconSummary(icon), matchReason: reason }));

  const searchLimit = Math.min(20, Math.max(10, limit * 3));
  let catalog = await search({
    query: intent,
    ...(collections.length ? { collections } : {}),
    limit: searchLimit
  });
  let usedGlobalFallback = false;
  if (collections.length && !catalog.results.length && !reuseCandidates.length) {
    catalog = await search({ query: intent, limit: searchLimit });
    usedGlobalFallback = true;
  }

  const selected = new Map<string, SearchResult>();
  for (const candidate of [...reuseCandidates, ...catalog.results]) {
    if (!selected.has(candidate.id)) selected.set(candidate.id, candidate);
    if (selected.size === limit) break;
  }
  const results = [...selected.values()].map((candidate) => {
    const record = installed[candidate.id];
    const status = project.installedIconStatus[candidate.id];
    return {
      ...candidate,
      installed: status === "current" || status === "customized",
      installedStatus: status ?? null,
      action:
        status === "current" || status === "customized"
          ? ("reuse" as const)
          : record
            ? ("repair" as const)
            : ("add" as const),
      recommendationReason:
        status === "current"
          ? `Already installed at ${record.path}. ${candidate.matchReason}`
          : status === "customized"
            ? `Customized component at ${record.path}; reuse it without regenerating. ${candidate.matchReason}`
            : record
              ? `Managed icon file is missing; run doctor before using it. ${candidate.matchReason}`
              : `${candidate.matchReason}${collections.length && !usedGlobalFallback ? ` Matches a collection already used in this project.` : ""}`,
      usage: usage(candidate.id, language, project.projectPath, fromFile)
    };
  });
  const reuseCount = results.filter(({ installed }) => installed).length;
  return {
    summary: `${results.length} recommendation(s); ${reuseCount} installed icon(s) ready to reuse`,
    projectPath: project.projectPath,
    intent: intent.trim(),
    initialized: project.initialized,
    target,
    language,
    fromFile: fromFile ?? null,
    installedIconCount: installedIds.size,
    managedIconCount: managedIds.length,
    installedCollections,
    searchedCollections: usedGlobalFallback ? [] : collections,
    usedGlobalFallback,
    searchSource: catalog.source,
    results
  };
};
