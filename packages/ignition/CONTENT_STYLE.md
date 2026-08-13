# Rocketicons content style

## Voice

Rocketicons sounds like a capable teammate who enjoys the work. Lead with the useful outcome, use short sentences, and keep a little launch-themed personality where it feels natural. Never trade accuracy for a clever line.

English should feel conversational and direct. Brazilian Portuguese should be written naturally for Brazilian developers, not translated word for word.

## Product message

Use this canonical explanation when the full positioning is needed:

> Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected components into your source tree for React and React Native, with Tailwind-compatible styling. No full icon collection is imported into the application, and unused icons do not rely on tree-shaking to disappear.

Shorter surfaces may compress it to “Find the right icon and add its component to your source tree.” Keep these facts intact:

- Selected icon source is written into the application.
- The application does not import a complete collection in the recommended workflow.
- Shared Rocketicons utilities and Tailwind integration are still installed.
- React and React Native are supported through web and native core files.

## Progressive disclosure

- Home: benefit first; one short explanation and a clear next action.
- Getting Started: copyable path from initialization to a rendered icon.
- Guides: constraints, tradeoffs, verification, and framework detail.
- Machine files: deterministic commands, stable URLs, licensing, and explicit availability.

## Guardrails

Do not claim JavaScript generation, batch `add`, JSON output, dry runs, configurable paths, or available MCP tools until those features ship. Do not make universal byte or bundle-size claims without a reproducible benchmark. Do not recommend importing a full icon collection except when explaining legacy migration.

Write headings that describe an outcome. Keep paragraphs compact enough for the existing layout, and reuse existing MDX components rather than introducing special presentation for ordinary copy.
