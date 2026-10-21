# @rocketicons/native-test

Minimal Expo app for testing rocketicons with NativeWind v4 on iOS.

## Setup

```bash
# From the repository root
npm install
npm run build-all
```

`build-all` generates `packages/icons`, which the app imports as `rocketicons`.

## Running

```bash
cd packages/native-test

# Start on iOS Simulator
npx expo start --ios

# TypeScript check
npm run typecheck
```

## Smoke test

```bash
npm run smoke -w packages/native-test
```

Exports the iOS bundle to `dist/` and checks that it contains `rocketicons/my`, the native `rocketicons/core` and `@rocketicons/utils`, and that the rocketicons Tailwind plugin emitted icon rules. It needs no simulator or Xcode, so CI runs it after building the icons.

## What it tests

| Feature        | Coverage                                     |
| -------------- | -------------------------------------------- |
| **Sizes**      | All 11 sizes (xs → 7xl) in a grid            |
| **Variants**   | Outlined vs filled side by side              |
| **Colors**     | Default (sky) + custom colors                |
| **Dark mode**  | Toggle button to verify dark/light rendering |
| **NativeWind** | className-based styling via NativeWind v4    |

## Notes

- This app is a root workspace, so its dependencies are hoisted to the root `node_modules`
- NativeWind v4 only supports Tailwind CSS v3, so the app uses `tailwind.config.js` with `nativewind/preset` and the rocketicons `nativeIconPlugin`, not the Tailwind CSS 4 setup used on the web
- iOS only (team works on macOS)
- Uses `file:../icons` to reference the local rocketicons package
