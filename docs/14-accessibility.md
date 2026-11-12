# 14 — Accessibility

Target WCAG 2.2 AA.

## Document

`lang="en"` unless the farm later asks for a Hindi or bilingual site. That is an open decision, not a Phase 1 task. The skip link is the first focusable control: “Skip to content”, visually hidden until focused, target `#content`.

## Structure

One `h1` per page. No skipped levels. Landmarks: `header`, `nav` with an accessible name “Primary”, `main`, `footer`. The mobile panel is a `nav` or a dialog. If it is a dialog, it has `aria-modal="true"` and a label “Menu”.

## Text and contrast

Use only the passing pairs in `design/colors.json`. Grain is not text. Status labels are text, not colour alone. Placeholder text in inputs is not the label. Labels are visible.

## Keyboard

Every action is reachable. Focus order matches the visual order. `:focus-visible` ring as specified. The menu traps focus. Escape closes it. No off-screen focusable control except the skip link’s target.

## Forms

Labels via `for` and `id`. `aria-invalid` and `aria-describedby` pointing at the error. Errors in a polite live region as well, so a screen reader hears the summary. The consent checkbox is required and is not pre-checked. Autocomplete `name`, `email` on the contact form.

## Media

The panicle `img` alt: “Line drawing of a rice panicle. This is an illustration, not a photograph of the farm.” Decorative contours are `aria-hidden` and empty alt if they are images. Future photographs use the farm’s alt, which names what is in the picture. Video has a pause button and does not autoplay with sound.

## Motion

See `13-interaction-and-motion.md`.

## Target size

48px for buttons and the menu control. 44px minimum for text links in the header. Inline prose links are exempt as text.

## Language of errors

Plain sentences. “Enter an email address.” “Say that you want harvest notes.” “The note was not sent. Check the fields and try again.”

## Content

Do not convey “not for sale” by greying out the whole page. Say it.
