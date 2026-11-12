# Component visuals

Behaviour, props, and states are in `docs/16-component-specifications.md`. This file is the look.

## Buttons

Height 48px. Padding 0 18px. Radius 2px. Outfit 15px, weight 500.

- Primary: green fill, raised-paper text. Hover darkens the green by mixing 12% ink. No shadow, no lift.
- Quiet: transparent, 1px `--line-strong` border, ink text. Hover border becomes green.
- Text: no box. Green. Underline on hover, offset 3px.

Disabled: 40% opacity, no pointer. Focus: 2px raktshali ring, 3px offset. Visible on keyboard only for mouse users is wrong. The ring shows for `:focus-visible`.

## Links in prose

Ink, underline always, offset 3px, colour of the underline is `--line-strong`. Hover colour raktshali.

## Header

72px. Sticky. Paper at 92% with a 1px line underneath. Wordmark in Fraunces, 18px, tracking 0.14em. Links in Outfit 15px, gap 28px. No cart. No account icon while accounts are off. Below 1024px the links become a full-screen paper menu. The wordmark stays. The button says Menu, and Close when open.

## Cards

Raised paper, 1px line, 2px radius, no shadow. Image area is a fixed ratio. Status sits on the image, top left, Outfit 12px, tracking 0.14em, uppercase, raktshali.

## Fields

Height 48px. Raised paper. 1px `#CDBFAE`. Radius 2px. Label above, 14px. Error text underneath in raktshali, with an icon-free sentence. Do not rely on the red alone.

## Dividers

1px `--line`. The journey uses a green top border on each step instead of a card.

## The dark band

Green field, raised-paper type, a 48px raktshali rule. This is the only full-bleed dark section on the homepage.

## Empty state

Raised paper, 1px line, padding 48px, one heading, one sentence. No illustration of a sad plant. No fake dates.

## Motion

See `docs/13-interaction-and-motion.md`. Hover colour changes in 160ms. No parallax.
