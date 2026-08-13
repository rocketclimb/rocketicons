# rocketicons

Search thousands of open-source icons, then add only the icons your project uses. Rocketicons writes selected React and React Native components into your source tree, with Tailwind-compatible styling.

The recommended workflow uses the CLI rather than importing a complete collection from this package:

```bash
npx @rocketicons/cli init
npx @rocketicons/cli add @rc/rc-rocket-icon
```

```tsx
import RcRocketIcon from "@/ri/icons/rc-rocket-icon";

export function Logo() {
  return <RcRocketIcon className="icon-sky-500-lg" />;
}
```

The current CLI requires TypeScript and `tsconfig.json`, writes to `src/ri`, installs `@rocketicons/utils` and `@rocketicons/tailwind` through npm during initialization, and accepts one icon per `add` command.

Generated icon files belong to your application. Review and commit them so builds do not depend on downloading an entire icon collection or on tree-shaking unused exports.

Legacy package exports remain available for compatibility and migration, but they are not the recommended add-only-what-you-use workflow.

- [Getting Started](https://rocketicons.io/en/docs/getting-started/)
- [Icon explorer](https://rocketicons.io/en/icons/)
- [Machine-readable guide](https://rocketicons.io/llms.txt)
- [Static catalog](https://rocketicons.io/ai/v1/catalog.json)

Rocketicons is MIT licensed. Individual icon collections retain their upstream licenses; consult the static catalog for project and license links.
