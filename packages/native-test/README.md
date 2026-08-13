# @rocketicons/native-test

Minimal Expo app for testing rocketicons with NativeWind v4 on iOS.

## Setup

```bash
cd packages/native-test
npm install
```

## Running

```bash
# Start on iOS Simulator
npx expo start --ios

# TypeScript check
npm run typecheck
```

## What it tests

| Feature        | Coverage                                     |
| -------------- | -------------------------------------------- |
| **Sizes**      | All 11 sizes (xs → 7xl) in a grid            |
| **Variants**   | Outlined vs filled side by side              |
| **Colors**     | Default (sky) + custom colors                |
| **Dark mode**  | Toggle button to verify dark/light rendering |
| **NativeWind** | className-based styling via NativeWind v4    |

## Notes

- This app is **not** part of the root monorepo workspaces — it has its own `node_modules`
- iOS only (team works on macOS)
- Uses `file:../icons` to reference the local rocketicons package
