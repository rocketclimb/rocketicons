const plugin = require("tailwindcss/plugin");

/**
 * Ignition-specific Tailwind plugin.
 * Extracted from tailwind.config.ts for TW v4's @plugin CSS-first model.
 *
 * Only addVariant and simple matchUtilities that work in v4.
 * All addComponents and complex matchUtilities (deep, etc.) have been
 * moved to globals.css as plain CSS.
 */
module.exports = plugin(({ addVariant, matchUtilities }) => {
  addVariant("highlight", "h1 + &");
  addVariant("section", "[data-section] &");
  addVariant("tab-section", "[data-section] section &");
  addVariant("prose", ".prose &");
  addVariant("blockquote", "blockquote &");
  addVariant("quote", ".quote &");
  addVariant("thin", ".thin &");
  addVariant("docked", "nav &");
  addVariant("landingpage", ".landingpage ~ .theme-selector &");
  addVariant("content", ".content ~ .theme-selector &");
  addVariant("hero", ".hero &");
  addVariant("icons-hero", ".icons-hero &");
  addVariant("icon-title-box", ".icon-title-box &");
  addVariant("icon-info-area", ".icon-info-area &");
  addVariant("after-p", "p ~ &");

  matchUtilities({
    "current-url": (value) => ({
      [`nav[data-current^="${value}"] &`]: {
        "border-color": "var(--color-sky-500)",
        "color": "var(--color-sky-500)"
      }
    })
  });

  matchUtilities({
    "current-url-is": (value) => ({
      [`nav[data-current="${value}"] &`]: {
        "border-color": "var(--color-sky-500)",
        "color": "var(--color-sky-500)"
      }
    })
  });
});
