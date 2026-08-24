import { afterEach, describe, expect, test } from "@jest/globals";
import {
  absoluteSiteUrl,
  getSiteBasePath,
  getSiteOrigin,
  normalizeSiteOrigin,
  withSiteBasePath
} from "./site-origin";

describe("SITE_ORIGIN", () => {
  const previousOrigin = process.env.SITE_ORIGIN;
  const previousNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (previousOrigin === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = previousOrigin;
    (process.env as Record<string, string | undefined>).NODE_ENV = previousNodeEnv;
  });

  test.each([
    ["https://rocket.example", "https://rocket.example"],
    ["https://icons.example/", "https://icons.example"],
    ["https://rocketclimb.github.io/rocketicons", "https://rocketclimb.github.io/rocketicons"],
    ["https://rocketclimb.github.io/rocketicons/", "https://rocketclimb.github.io/rocketicons"],
    ["http://preview.example:8080", "http://preview.example:8080"]
  ])("normalizes %s", (input, expected) => {
    expect(normalizeSiteOrigin(input)).toBe(expected);
  });

  test.each(["https://example.com/?preview=1", "https://user@example.com", "ftp://example.com"])(
    "rejects a non-root origin: %s",
    (origin) => {
      expect(() => normalizeSiteOrigin(origin)).toThrow();
    }
  );

  test("builds absolute URLs without coupling application state to a hostname", () => {
    process.env.SITE_ORIGIN = "https://icons.example/rocketicons";
    expect(getSiteBasePath()).toBe("/rocketicons");
    expect(withSiteBasePath("/ai/v1/catalog.json")).toBe("/rocketicons/ai/v1/catalog.json");
    expect(absoluteSiteUrl("/en/icons/ai/").toString()).toBe(
      "https://icons.example/rocketicons/en/icons/ai/"
    );
  });

  test("requires SITE_ORIGIN for production SEO generation", () => {
    delete process.env.SITE_ORIGIN;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    expect(() => getSiteOrigin()).toThrow("SITE_ORIGIN is required");
  });
});
