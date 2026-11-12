# 13 — Interaction and motion

The site is quiet. Motion explains a change. It does not decorate the scroll.

## Durations

- Colour and border hover: 160ms
- Mobile menu open: 200ms opacity. No slide that travels more than 8px
- Easing: `cubic-bezier(0.2, 0, 0, 1)`

No scroll-triggered fade-in of sections. Content is visible without JavaScript animation. If a section is animated later, it must be optional and disabled under reduced motion.

## Hover

Primary button: background mixes toward ink, about 12%. Quiet button: border becomes green. Card: border becomes green. Text link: underline colour becomes burgundy. No scale, no shadow, no image zoom that hides the crop.

## Header

Sticky. It does not hide on scroll. A shadow does not appear. The hairline is enough.

## Forms

Submit disables the button and sets its label to “Sending…” until the action returns. Errors do not shake the form. Focus moves to the first invalid field.

## Video, later

Muted, inline, with a pause control that is a real button. Reduced motion: poster only, no autoplay. Captions if there is speech.

## Menu

Described in the homepage spec and the responsive spec. The panel does not animate from the side in a way that leaves content exposed to pointer events. `inert` on the page underneath while open.

## Loading

Phase 1 pages are server-rendered. A loading state is needed for the sign-in route only, using Clerk’s component. Public pages do not show a skeleton of a farm. The journal and crop pages have empty states, not spinners.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` sets animation and transition duration to 0.01ms. The menu appears. Video does not autoplay.
