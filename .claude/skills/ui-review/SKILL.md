---
name: ui-review
description: Audit components for Gradient design system consistency, accessibility, and visual coherence. Use when reviewing UI code, checking design compliance, or before merging frontend changes.
---

Review the components in `$ARGUMENTS` (or all changed files if no argument) for Gradient design system compliance.

## Audit checklist

### 1. Color usage
- [ ] All colors reference CSS custom properties — no hardcoded hex/rgb values
- [ ] Primary accent uses `var(--primary)` (#990FFA), not old navy (#1a2b4b)
- [ ] Status colors use the correct semantic token (`--holiday`, `--sick`, `--remote`, `--birthday`)
- [ ] Text uses `var(--text)` or `var(--text-muted)` — never `#000`, `black`, or arbitrary grays
- [ ] Backgrounds use `var(--surface)` for cards, `var(--bg)` for page background
- [ ] Gradient accents use `var(--gradient-primary)`, `var(--gradient-surface)`, or `var(--gradient-subtle)`

### 2. Typography
- [ ] Body font is Montserrat (inherited from body)
- [ ] Display/hero headings optionally use Space Grotesk
- [ ] Font sizes use the established scale: 12px (labels), 13px (subtext), 14px (body), 16px (headings)
- [ ] Font weights follow convention: 400 (body), 500 (secondary nav), 600 (labels/pills/buttons), 700 (headings), 800 (branding)
- [ ] No custom font-family declarations unless intentionally using Space Grotesk or JetBrains Mono

### 3. Spacing & layout (8pt grid)
- [ ] Card padding is `22px 24px`
- [ ] Section gaps are `24px`, inner gaps are `8px`, `12px`, or `16px`
- [ ] Border radius uses `var(--radius)`, `var(--radius-sm)`, or `var(--radius-lg)` — no hardcoded values
- [ ] Box shadows use `var(--shadow)` or `var(--shadow-md)` (primary-tinted, not neutral gray)

### 4. Component patterns
- [ ] Cards use `className="card"` — not custom border/shadow/radius combinations
- [ ] Primary buttons use `.btn-primary` with gradient background and purple glow shadow
- [ ] Secondary buttons use `.btn-secondary` with hover state transitioning to primary-bg
- [ ] Status badges use `.pill` + `.pill-{status}`
- [ ] Avatars use `.avatar` class with gradient-primary background
- [ ] Icons are from `lucide-react`, sized at 20-22px

### 5. Accessibility
- [ ] Interactive elements are `<button>` or `<a>`, not clickable `<div>`s
- [ ] Modals close on Escape key
- [ ] Modals lock body scroll when open
- [ ] Form inputs have associated labels or aria-label
- [ ] Color is not the only way to convey status (icons or text accompany it)
- [ ] Touch targets are at least 44x44px

### 6. Responsiveness
- [ ] No fixed widths that would cause horizontal overflow on narrow screens
- [ ] Grid layouts degrade gracefully (check `@media (max-width: 1100px)`)

## Output format

For each file reviewed, report:
- **Pass**: Rules followed correctly
- **Violations**: Specific line numbers and what to fix
- **Suggestions**: Non-blocking improvements

Sort violations by severity: accessibility issues first, then design token violations, then spacing inconsistencies.
