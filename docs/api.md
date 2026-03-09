# CSS API & Embedding Guide

[← Back to README](../README.md)

## CSS Custom Properties

All properties use the `--ndx-` prefix and can be overridden from outside the Shadow DOM boundary by targeting the `ndx-calc` element.

### Color Tokens

| Property | Purpose | Light Default | Dark Default |
|----------|---------|---------------|--------------|
| `--ndx-bg` | Component background | `#fafafa` | `#1a1a1e` |
| `--ndx-surface` | Card/input surface | `#ffffff` | `#242428` |
| `--ndx-surface-alt` | Alternate surface (filter info) | `#f0f0f2` | `#2e2e34` |
| `--ndx-text` | Primary text | `#1a1a1a` | `#e8e8ed` |
| `--ndx-text-secondary` | Secondary/label text | `#6b6b6b` | `#9a9aa0` |
| `--ndx-accent` | Accent color (buttons, focus) | `#2563eb` | `#60a5fa` |
| `--ndx-accent-hover` | Accent hover state | `#1d4ed8` | `#93bbfd` |
| `--ndx-accent-text` | Text on accent backgrounds | `#ffffff` | `#1a1a1e` |
| `--ndx-border` | Border color | `#e0e0e0` | `#3a3a40` |
| `--ndx-result-bg` | Result section background | `#eff6ff` | `#1e293b` |
| `--ndx-warning` | Warning/limit text | `#dc2626` | `#f87171` |

### Spacing Tokens

| Property | Purpose | Default |
|----------|---------|---------|
| `--ndx-space-xs` | Extra small spacing | `4px` |
| `--ndx-space-sm` | Small spacing | `8px` |
| `--ndx-space-md` | Medium spacing | `16px` |
| `--ndx-space-lg` | Large spacing | `24px` |
| `--ndx-space-xl` | Extra large spacing | `32px` |

### Typography Tokens

| Property | Purpose | Default |
|----------|---------|---------|
| `--ndx-font-family` | Primary font stack | `system-ui, -apple-system, sans-serif` |
| `--ndx-font-mono` | Monospace font stack | `ui-monospace, 'SF Mono', monospace` |
| `--ndx-font-size-sm` | Small text | `0.8125rem` |
| `--ndx-font-size-base` | Base text | `0.9375rem` |
| `--ndx-font-size-lg` | Large text (title) | `1.125rem` |
| `--ndx-font-size-xl` | Extra large | `1.75rem` |
| `--ndx-font-size-2xl` | Result value | `2.5rem` |

### Shape & Motion Tokens

| Property | Purpose | Default |
|----------|---------|---------|
| `--ndx-radius-sm` | Small border radius | `6px` |
| `--ndx-radius-md` | Medium border radius | `10px` |
| `--ndx-radius-lg` | Large border radius | `14px` |
| `--ndx-transition` | Transition timing | `150ms ease` |

## Embedding Guide

### Ghost

In the Ghost editor, click `+` → select **HTML** card → paste the contents of `dist/index.html`.

### WordPress

In the block editor, add a **Custom HTML** block → paste the contents of `dist/index.html`.

### Hugo

Paste directly in your markdown file. Hugo passes raw HTML through:

```markdown
---
title: "My Photography Post"
---

Some text about ND filters...

<ndx-calc></ndx-calc>
<script>
// Paste minified script here
</script>
```

Or create a Hugo shortcode in `layouts/shortcodes/ndx.html`.

### Astro

In any `.astro` file:

```astro
---
// No imports needed
---
<ndx-calc></ndx-calc>
<script>
// Paste component script here
</script>
```

### Generic HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ND Filter Calculator</title>
</head>
<body>
  <!-- Paste dist/index.html content here -->
</body>
</html>
```

## Theme Customization Examples

### Warm Photography Theme

```css
ndx-calc {
  --ndx-accent: #d97706;
  --ndx-accent-hover: #b45309;
  --ndx-accent-text: #ffffff;
  --ndx-bg: #fffbeb;
  --ndx-result-bg: #fef3c7;
  --ndx-font-family: 'Playfair Display', Georgia, serif;
}
```

### Minimal Monochrome

```css
ndx-calc {
  --ndx-accent: #374151;
  --ndx-accent-hover: #1f2937;
  --ndx-bg: #ffffff;
  --ndx-surface: #f9fafb;
  --ndx-border: #d1d5db;
  --ndx-result-bg: #f3f4f6;
  --ndx-radius-sm: 2px;
  --ndx-radius-md: 4px;
  --ndx-radius-lg: 6px;
}
```

### Bold Dark Theme

```css
ndx-calc {
  --ndx-accent: #8b5cf6;
  --ndx-accent-hover: #a78bfa;
  --ndx-accent-text: #ffffff;
  --ndx-bg: #0f0f23;
  --ndx-surface: #1a1a2e;
  --ndx-surface-alt: #16213e;
  --ndx-text: #e2e8f0;
  --ndx-text-secondary: #94a3b8;
  --ndx-border: #2d3748;
  --ndx-result-bg: #1e1b4b;
}
```
