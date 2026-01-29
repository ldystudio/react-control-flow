# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

react-solidlike is a declarative React control flow components library inspired by Solid.js. It replaces ternary expressions and `array.map()` in JSX with cleaner declarative components. Supports React and React Native.

## Commands

```bash
# Install dependencies
bun install --no-cache

# Run all tests
bun test

# Run single test file
bun test src/For.test.tsx

# Lint check
bun run lint

# Lint and auto-fix
bun run lint:fix

# Build (outputs to dist/)
bun run build
```

## Code Style

- Uses Biome for linting and formatting
- 4-space indentation, double quotes, semicolons required
- Line width: 120 characters
- After modifying code, run `bunx biome check <files>` to verify

## Architecture

All components are in `src/` with co-located test files (`*.test.tsx`):

| Component              | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `Show`                 | Conditional rendering (replaces ternary)                   |
| `For`                  | List rendering (replaces `array.map()`)                    |
| `Repeat`               | Repeat rendering (replaces `Array.from({ length }).map()`) |
| `Split`                | String split rendering (split string and render each part) |
| `Switch/Match/Default` | Multi-branch rendering                                     |
| `Await`                | Async promise handling                                     |
| `Dynamic`              | Dynamic component selection                                |
| `ErrorBoundary`        | Error catching                                             |
| `QueryBoundary`        | Query state handling (loading/error/empty/success)         |

Each component exports its Props interface alongside the component. All exports are aggregated in `src/index.ts`.

## Testing

- Tests use `bun:test` with `react-dom/server` for SSR testing via `renderToString`
- Tests verify rendered HTML output and callback behavior
- Note: React SSR inserts `<!-- -->` comments between JSX expressions, so avoid asserting exact concatenated strings

## Workflow

When modifying components:
1. Add or update test cases for the changes
2. Run `bun test` to ensure all tests pass
3. Run `bunx biome check <files>` to verify code style
4. Update both `README.md` (Chinese) and `README.en.md` (English) with new features/changes
