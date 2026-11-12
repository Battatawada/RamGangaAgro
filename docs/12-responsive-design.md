# 12 — Responsive design

Breakpoints are min-widths: 640, 768, 1024, 1280. Design mobile first in CSS. Check at 360, 390, 768, 1024, and 1280.

## What changes at 1024px

The header links appear. The hero becomes two columns. The crop introduction becomes two columns. The journey becomes five columns. The green band becomes two columns. Follow becomes two columns. Contact becomes two columns. Below 1024px all of these are one column, in the DOM order given in the page specs.

## What changes at 768px

The crop card and a future journal row become horizontal. Below that, media stacks above text.

## Type

Hero and titles use `clamp` so they do not overflow at 360px. Body stays 17px. Do not drop body to 14px. Eyebrows stay 12px with 0.16em tracking. If an eyebrow wraps, that is acceptable. Do not shrink tracking to force one line.

## Touch

Buttons and the menu control are at least 48px tall. Nav links in the mobile panel are at least 48px in the hit area. The checkbox label is associated and the hit area includes the label text.

## Images

The hero slot is 4/5 in the column and does not use a fixed pixel height that crops the SVG. Photographs use the ratios in `design/breakpoints.json` and `object-fit: cover`. Always set width and height or aspect-ratio to avoid layout shift.

## The mobile menu

Full viewport, paper, under the 72px header. Page scroll locked. Focus trap. First item focused on open. Close on Escape, on the button, and when a link is activated.

## Tables and facts

The crop definition list stacks the label above the value under 640px.

## Do not

A separate mobile site. Horizontal scroll on the journey. A carousel to hide the five steps. Sticky buy bars. There is nothing to buy.
