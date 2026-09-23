import { describe, expect, test } from "@jest/globals";

import {
  collectionNameFromIndex,
  iconDescription,
  iconDisplayName,
  iconTitle,
  iconUrl,
  indexContainsIcon,
  isWellFormedIconId,
  matchCollectionPath
} from "./og-icon-meta";

const COLLECTION = "Font Awesome 6";
const SITE = "rocketicons";

describe("per-icon card metadata", () => {
  test("only collection pages are rewritten", () => {
    expect(matchCollectionPath("/en/icons/fa6/")).toEqual({ lang: "en", collectionId: "fa6" });
    expect(matchCollectionPath("/pt-br/icons/wi")).toEqual({ lang: "pt-br", collectionId: "wi" });
    expect(matchCollectionPath("/en/icons/")).toBeUndefined();
    expect(matchCollectionPath("/en/docs/colors/")).toBeUndefined();
    expect(matchCollectionPath("/fr/icons/fa6/")).toBeUndefined();
  });

  test("rejects input that could inject text into a shared card", () => {
    // The card links to rocketicons.com, so an attacker-chosen title would be misleading.
    expect(isWellFormedIconId("fa-accessible-icon")).toBe(true);
    expect(isWellFormedIconId("free bitcoin click here")).toBe(false);
    expect(isWellFormedIconId("Fa-Accessible")).toBe(false);
    expect(isWellFormedIconId("noseparator")).toBe(false);
    expect(isWellFormedIconId(`fa-${"x".repeat(80)}`)).toBe(false);
  });

  test("existence check does not false-positive on a shared prefix", () => {
    const index = '{"icons":[{"id":"fa-0-circle","name":"0 circle"},{"id":"fa-acorn"}]}';

    expect(indexContainsIcon(index, "fa-0-circle")).toBe(true);
    // "fa-0" is a real icon elsewhere; it must not match because of the closing quote.
    expect(indexContainsIcon(index, "fa-0")).toBe(false);
    expect(indexContainsIcon(index, "fa-nope")).toBe(false);
  });

  test("derives the display name the way the site titles it", () => {
    expect(iconDisplayName("fa-accessible-icon")).toBe("Accessible Icon");
    expect(iconDisplayName("wi-day-sunny")).toBe("Day Sunny");
    expect(iconDisplayName("fa-0")).toBe("0");
    expect(iconDisplayName("rocket")).toBe("Rocket");
  });

  test("leads with the icon and drops the tagline so the title still fits a card", () => {
    const title = iconTitle("Accessible Icon", COLLECTION, SITE);

    expect(title).toBe("Accessible Icon | Font Awesome 6 | rocketicons");
    expect(title.length).toBeLessThan(60);
  });

  test("description names the icon and its collection", () => {
    expect(iconDescription("Accessible Icon", COLLECTION, SITE)).toBe(
      "Accessible Icon from Font Awesome 6. Add the React or React Native component to your project with rocketicons."
    );
  });

  test("reads the collection name from the index without parsing it", () => {
    const index =
      '{"schemaVersion":1,"collection":{"id":"fa6","name":"Font Awesome 6","totalIcons":2058,' +
      '"contextCoverage":{"total":2058}},"icons":[{"id":"fa-acorn"}]}';

    expect(collectionNameFromIndex(index)).toBe("Font Awesome 6");
    expect(collectionNameFromIndex("{}")).toBeUndefined();
  });

  test("builds the shared URL from the page origin, not the request host", () => {
    // A preview or *.pages.dev host must not leak into the card's link.
    expect(iconUrl("https://rocketicons.com/en/icons/fa6/", "fa-accessible-icon")).toBe(
      "https://rocketicons.com/en/icons/fa6/?icon=fa-accessible-icon"
    );
    expect(iconUrl("not a url", "fa-acorn")).toBeUndefined();
  });
});
