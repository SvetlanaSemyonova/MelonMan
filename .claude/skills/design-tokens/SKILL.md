---
name: design-tokens
description: Add, modify, or extend design tokens in the MelonStaff Gradient CSS custom property system. Use when the user wants to add new colors, spacing values, status types, or theme variables.
---

Manage the Gradient design token system defined in `src/index.css` under `:root`.

## Current token inventory

Check the live state by reading `src/index.css` before making changes.

## Rules for adding or changing tokens

### Naming conventions
- **Colors**: `--{semantic-name}` for the main color, `--{semantic-name}-bg` for the light tint background
  - Example: `--holiday: #990FFA` / `--holiday-bg: #f3e8ff`
- **Gradients**: `--gradient-{purpose}` using primary (#990FFA) to secondary (#E60076) spectrum
- **Spacing/layout**: `--{purpose}` (e.g. `--sidebar-width`, `--right-col`)
- **Effects**: `--shadow`, `--shadow-md`, `--shadow-lg` (graduated scale, tinted with primary)
- **Radii**: `--radius` (12px default), `--radius-sm` (8px), `--radius-lg` (16px)

### Adding a new status color
When adding a new absence/status type:
1. Add both the main color and the `-bg` light tint to `:root`
2. Add a `.pill-{name}` class using the new tokens
3. Verify the color meets WCAG AA contrast on its background tint (4.5:1 for text)

Example:
```css
/* In :root */
--training: #f59e0b;
--training-bg: #fffbeb;

/* New pill class */
.pill-training {
  background: var(--training-bg);
  color: var(--training);
}
```

### Adding a new gradient
Gradients in this system flow from primary (#990FFA) to secondary (#E60076):
```css
--gradient-new: linear-gradient(135deg, #990FFA 0%, #E60076 100%);
```
For subtle/surface gradients use the `-bg` variants of primary and secondary.

### Modifying existing tokens
- Changing a token value affects every component that uses it — grep for the variable name first
- Run `grep -r "var(--token-name)" src/` to find all usages before modifying
- Update any inline style objects that reference the token

### Responsive tokens
The project overrides tokens in `@media` blocks:
```css
@media (max-width: 1100px) {
  :root {
    --right-col: 100%;
  }
}
```
Follow this pattern for any layout tokens that need responsive behavior.

### Checklist
1. Token names are lowercase, hyphenated, semantic (not `--purple-500`)
2. Color pairs exist: main + `-bg` variant for any status type
3. Pill class added if it's a new status category
4. Grep confirms no unintended side effects from changed tokens
5. Contrast ratio meets WCAG AA (4.5:1 minimum)
6. Shadows use primary-tinted rgba values, not neutral grays
