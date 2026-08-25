import { describe, expect, test } from "@jest/globals";

import { buildDocumentRecords, buildIconRecords, validateAlgoliaRecords } from "./records";

describe("Algolia records", () => {
  test("stores each icon once with a collision-safe object ID", () => {
    const records = buildIconRecords(
      [
        {
          collectionId: "lu",
          iconId: "rocket",
          name: "Rocket",
          component: "LuRocket",
          categories: ["outline"]
        }
      ],
      { lu: "Lucide" }
    );

    expect(records).toEqual([
      expect.objectContaining({
        objectID: "icon:lu:rocket",
        iconId: "rocket",
        groupName: "Lucide",
        locale: "all",
        recordType: "icon"
      })
    ]);
  });

  test("uses the localized parent title and keeps the localized route slug", () => {
    const records = buildDocumentRecords(
      [
        {
          title: "Getting started",
          slug: "getting-started",
          enslug: "getting-started",
          group: "getting-started",
          locale: "en",
          content: "Start here",
          isComponent: false
        },
        {
          title: "Primeiros passos",
          slug: "primeiros-passos",
          enslug: "getting-started",
          group: "getting-started",
          locale: "pt-br",
          content: "Comece aqui",
          isComponent: false
        },
        {
          title: "Instalação",
          slug: "instalacao",
          enslug: "installation",
          group: "getting-started",
          locale: "pt-br",
          content: "Instale o pacote",
          isComponent: true
        }
      ],
      "en"
    );

    expect(records[2]).toEqual(
      expect.objectContaining({
        objectID: "document:pt-br:installation",
        documentId: "installation",
        groupName: "Primeiros passos",
        slug: "instalacao"
      })
    );
  });

  test("rejects duplicate IDs and records that could exceed the Build plan limit", () => {
    const records = buildIconRecords(
      [
        {
          collectionId: "lu",
          iconId: "rocket",
          name: "Rocket",
          component: "LuRocket",
          categories: ["outline"]
        }
      ],
      { lu: "Lucide" }
    );

    expect(() => validateAlgoliaRecords([...records, ...records])).toThrow(
      "Duplicate Algolia objectID"
    );
    expect(() => validateAlgoliaRecords(records, 10)).toThrow("safe limit is 10");
  });
});
