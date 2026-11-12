# 04 — Design system

Apply `design/tokens.md` and the JSON files. This document is the ruleset.

## Colour

Page: `--paper` `#F4EFE6`. Raised surfaces: `#FBF8F3`. Text: `#1C1915`. Secondary text: `#3A342C` (10.74:1 on paper, AAA).

Green `#1C3328` is for eyebrows, primary buttons, the journey rules, and the single dark band. Burgundy `#6E2A32` is for status, focus, the short rule in the dark band, and error text. Both clear AAA against paper and against each other when paper type sits on them (raised on green 12.76:1, raised on burgundy 9.72:1).

Clay `#7A5340` is AA only (5.84:1). Use it at 16px or larger. Captions use clay-deep `#5C3D2E` (8.48:1).

Grain `#C6A56A` is decorative. It fails as text on paper.

There is no dark theme in Phase 1. The green band is a section, not a mode.

Semantic states always include words: Currently growing, Seasonal harvest, Coming soon, Available soon, Sent, Something went wrong.

## Type

| Role | Family | Size | Line | Weight |
|---|---|---|---|---|
| Hero | Fraunces | clamp(2.75rem, 5vw, 4.75rem) | 1.05 | 560 |
| Page title | Fraunces | clamp(2.25rem, 4vw, 3.5rem) | 1.1 | 560 |
| Section | Fraunces | clamp(1.75rem, 3vw, 2.5rem) | 1.15 | 520 |
| Card title | Fraunces | clamp(1.35rem, 2vw, 1.75rem) | 1.25 | 520 |
| Deck | Outfit | 1.25rem | 1.55 | 400 |
| Body | Outfit | 1.0625rem | 1.65 | 400 |
| Eyebrow | Outfit | 0.75rem, tracking 0.16em, uppercase | 1.2 | 500 |
| Button | Outfit | 0.9375rem | 1 | 500 |
| Caption | Outfit | 0.8125rem | 1.4 | 400 |

Load with `next/font/google`, `display: swap`, latin subset. Fallback: Georgia, then Outfit’s fallback Segoe UI.

Do not justify text. Do not set body above 72 characters. The measure is 40rem.

## Layout

Content 1120px. Header and footer inner width 1280px is allowed, but Phase 1 uses 1120px for both so the columns align. Prose 680px. Gutters 32px from 1024px, 20px below. Section padding 96px vertical from 1024px, 64px below 640px. Between 640 and 1023, use 80px.

Breakpoints, min-width: 640, 768, 1024, 1280. The structural change is at 1024.

## Surfaces

Radius 2px on buttons, inputs, and media. Hairline `#E3D9CC`. No shadows. Hover does not lift a card. A card’s border may shift to green.

## Focus and contrast

`:focus-visible` is a 2px burgundy ring, 3px offset. Minimum target 44px, buttons 48px. Contrast pairs that fail are forbidden: grain as text on paper, ink on burgundy, grain as small text on burgundy (4.41:1).

## Components

See `design/components.md` for the look and `16-component-specifications.md` for behaviour.

## Motion

160–200ms, ease-out, colour and opacity only. `prefers-reduced-motion: reduce` disables transitions longer than 0ms and shows the video poster instead of playback. Details in `13-interaction-and-motion.md`.
