---
name: ui-component
description: Create a new React UI component following MelonStaff's Gradient design system. Use when the user asks to build a new component, widget, card, modal, or UI section.
argument-hint: "[ComponentName]"
---

Create a new React component named `$ARGUMENTS` in `src/components/`.

## Design system rules

This project uses a **Gradient design system** with CSS custom properties — no Tailwind, no CSS-in-JS. Follow these conventions exactly:

### Styling approach
- Use **CSS custom properties** from `src/index.css` for all colors, radii, and shadows
- Use **inline `style` objects** for component-specific layout (flex, grid, padding, gap)
- Use **CSS class names** (`.card`, `.btn`, `.btn-primary`, `.btn-secondary`, `.pill`, `.avatar`) for reusable patterns — do not redefine them inline
- For responsive breakpoints or animations, add an inline `<style>` block inside the component's JSX

### Design tokens (reference — do NOT hardcode hex values)
```
Primary:    var(--primary) #990FFA, var(--primary-light) #b44dff, var(--primary-bg) #f3e8ff
Secondary:  var(--secondary) #E60076, var(--secondary-light) #ff339a, var(--secondary-bg) #fce7f3
Surface:    var(--surface) #ffffff, var(--bg) #faf5ff, var(--border) #e9d5ff
Text:       var(--text) #111827, var(--text-muted) #6b7280
Status:     var(--holiday), var(--holiday-bg), var(--sick), var(--sick-bg), var(--remote), var(--remote-bg)
            var(--birthday), var(--birthday-bg), var(--success), var(--success-bg), var(--warning), var(--warning-bg)
Gradients:  var(--gradient-primary), var(--gradient-surface), var(--gradient-subtle)
Radii:      var(--radius) = 12px, var(--radius-sm) = 8px, var(--radius-lg) = 16px
Shadows:    var(--shadow), var(--shadow-md)
Layout:     var(--sidebar-width) = 248px, var(--right-col) = 300px
```

### Typography
- Font: Montserrat (primary), Space Grotesk (display/headings), JetBrains Mono (code)
- Base size: 14px / line-height 1.5
- Headings: `fontSize: 16`, `fontWeight: 700`
- Display headings: `fontFamily: "'Space Grotesk', sans-serif"`
- Subtext/muted: `fontSize: 13`, `color: "var(--text-muted)"`
- Labels/small: `fontSize: 12`, `fontWeight: 600`
- Spacing scale: 8pt baseline grid (8, 16, 24, 32, 40, 48)

### Icons
- Use `lucide-react` for all icons
- Standard icon size: `size={20}` for inline, `size={22}` for section headers
- Icon color: `color="var(--text-muted)"` for decorative, semantic color vars for status

### Component structure pattern
```tsx
import { useState } from "react";
import { IconName } from "lucide-react";

export function ComponentName() {
  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Title</h2>
        <IconName size={22} color="var(--text-muted)" />
      </div>
      {/* content */}
    </div>
  );
}
```

### Gradient accents
- Primary buttons use `background: var(--gradient-primary)` with `box-shadow: 0 2px 8px rgba(153, 15, 250, 0.25)`
- Feature/CTA panels use `background: var(--gradient-primary)` with white text
- Subtle backgrounds use `var(--gradient-subtle)` or `var(--gradient-surface)`
- Avatars use `background: var(--gradient-primary)` with white text

### Modals
- Use a fixed backdrop: `background: rgba(17, 24, 39, 0.45)`, `backdropFilter: "blur(4px)"`
- Close on Escape key (add `useEffect` with keydown listener)
- Lock body scroll when open: `document.body.style.overflow = "hidden"`
- Max width: 480px, centered with flexbox

### Spacing conventions (8pt grid)
- Card padding: `22px 24px`
- Section gap: `24px`
- Inner element gap: `8px`, `12px`, or `16px`
- Grid gap: `16px` within cards, `24px` between cards
- Bottom margin for section headings: `16px`

### Checklist before finishing
1. All colors use CSS custom properties — no hardcoded hex
2. Component is a named export (not default)
3. TypeScript — props typed with an interface if needed
4. Accessible: buttons have labels, modals close on Escape, interactive elements are focusable
5. Responsive: test that it doesn't overflow on narrow viewports
6. Gradient accents used for primary actions and CTAs
