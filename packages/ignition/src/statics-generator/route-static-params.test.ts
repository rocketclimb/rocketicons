import { describe, expect, test } from "@jest/globals";

import collections from "@/data-helpers/params/collections.json";
import { collectionPageParams, localePageParams } from "./route-static-params";

describe("dynamic page static parameters", () => {
  test("locale home page exports both supported languages", () => {
    expect(localePageParams()).toEqual([{ lang: "en" }, { lang: "pt-br" }]);
  });

  test("collection leaf page exports every localized collection route", () => {
    const params = collectionPageParams();

    expect(params).toHaveLength(collections.length * 2);
    for (const { collectionid } of collections) {
      expect(params).toContainEqual({ lang: "en", collectionid });
      expect(params).toContainEqual({ lang: "pt-br", collectionid });
    }
  });
});
