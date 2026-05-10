---
name: eldoreth-design-system
description: Use Eldoreth's design tokens, type roles, and component conventions when building UI for pm.eldoreth.com (React + Tailwind v4 + shadcn/ui). Invoke whenever you write or edit a component, page, or style in the Eldoreth Process Intelligence Suite codebase.
---

# Eldoreth Design System

You are working in the **Eldoreth Process Intelligence Suite** codebase
(`pm.eldoreth.com`). The visual & interaction language is defined here.
**Follow every rule below.** Deviations need explicit user approval.

## Stack
- **React** + **Tailwind CSS v4** (`@theme` block in `src/styles.css`)
- **shadcn/ui** (style: "new-york", configured in `components.json`)
- Lucide icons, Inter (sans), JetBrains Mono (mono)

## Color rules
- Brand colors: `navy`, `navy-deep`, `electric`, `electric-glow`,
  `success`, `warning`, `destructive`. Use Tailwind utilities:
  `bg-electric`, `text-navy`, `border-electric`, `ring-electric`.
- **Never invent new hex codes.** If you need a tint, use opacity
  (`bg-electric/10`) or pull from the muted/accent ramp.
- **Sidebar is always dark** (`bg-sidebar`). Never light-mode it.
- Charts: only `chart-1` … `chart-5`. No rainbow palettes.

## Type rules
- Sans = Inter. Mono = JetBrains Mono. Nothing else.
- Sizes are tokens, not arbitrary: `text-xs` (11), `text-sm` (13),
  `text-base` (14), `text-md` (16), `text-xl` (20), `text-3xl` (28),
  `text-metric` (36), `text-hero` (72).
- **Eyebrow labels**: `text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium`.
- **Page title**: `text-3xl font-bold text-navy tracking-tight`.
- **Section title**: `text-xl font-semibold text-navy`.
- **Numbers/metrics**: always `font-variant-numeric: tabular-nums`
  (utility class `tabular-nums`). Bold + navy.

## Radius & shadow
- Radius scale stops at `rounded-2xl` (16 px). **No `rounded-full`
  on buttons, cards, or inputs.** Pills/avatars only.
- Two shadows total: `shadow-sm` (default lift) and `shadow` (popovers).
  No glow, no large-blur drops, no inner shadows.

## Buttons (hierarchy is sacred)
- **One** primary filled button per screen — the main CTA.
- Primary = `bg-electric text-white hover:bg-electric/90`, no shadow.
- Secondary = outline (`border bg-white text-navy`).
- Tertiary = ghost (text only, no border).
- Sizes: 40 px default, 32 px small, 48 px hero. Radius 6 px max.
- **No orange, no destructive-red unless the action actually deletes data.**

## Components
- Use shadcn/ui primitives (`<Button>`, `<Card>`, `<Badge>`, …) — they are
  already wired to our tokens. Don't fork them; extend via `className`.
- New components go in `src/components/` (cross-section) or
  `src/components/sections/<section>/` (section-local).
- **No emoji** in product UI. Use Lucide icons.

## Spacing & layout
- Spacing scale follows Tailwind defaults (4 px base).
- Cards use `p-6` (24 px) by default, `p-4` (16 px) for dense lists.
- Card grids: `gap-4` (16 px) default, `gap-6` for the dashboard.
- Form labels and values stack: label on top row (eyebrow style),
  value flush right same row, control below with 8 px gap.

## Copy tone
- **Direct, technical, lowercase-friendly.** No marketing fluff.
- Numbers in metrics carry units inline ("12h", "10%", "150 cases").
- Empty states explain what's missing AND what to do next.

## Before you ship
1. No new colors outside the token set.
2. No emoji.
3. One primary button per screen.
4. Tabular numerals on all metrics.
5. Radius ≤ 16 px, no `rounded-full` outside pills.
6. Sidebar still dark.

## Reference
- Tokens live in `src/styles.css` (`@theme` block).
- Visual reference deck: ask the user for the latest export of the
  Eldoreth Design System Origami project, or rebuild via the
  `preview/` cards in that project.
