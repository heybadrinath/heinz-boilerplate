# UI Design Guidelines

This document outlines the design system and guidelines for the Heinz Boilerplate frontend.

## Color Palette

### Primary Colors

```css
/* Primary Red - KraftHeinz Brand */
--color-primary: #dc2626;
--color-primary-hover: #b91c1c;
--color-primary-light: #fef2f2;

/* Neutral Grays */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;

/* System Colors */
--color-white: #ffffff;
--color-black: #000000;
```

### Hex Values

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Red | `#dc2626` | Primary buttons, links, brand elements |
| Primary Red Hover | `#b91c1c` | Hover states for primary elements |
| Primary Light | `#fef2f2` | Background highlights, subtle accents |
| Gray 50 | `#f9fafb` | Light backgrounds, cards |
| Gray 100 | `#f3f4f6` | Secondary buttons, disabled states |
| Gray 200 | `#e5e7eb` | Borders, dividers |
| Gray 500 | `#6b7280` | Secondary text, icons |
| Gray 700 | `#374151` | Primary text color |
| Gray 900 | `#111827` | Headings, high contrast text |

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes

| Element | Size | Line Height | Weight | Usage |
|---------|------|-------------|---------|-------|
| h1 | 48px (3rem) | 1.1 | 800 | Main page titles |
| h2 | 36px (2.25rem) | 1.2 | 700 | Section headers |
| h3 | 24px (1.5rem) | 1.25 | 600 | Subsection headers |
| h4 | 20px (1.25rem) | 1.25 | 600 | Component titles |
| h5 | 18px (1.125rem) | 1.3 | 600 | Small headings |
| h6 | 16px (1rem) | 1.4 | 600 | Minor headings |
| Body Large | 20px | 1.6 | 400 | Hero descriptions |
| Body | 16px | 1.6 | 400 | Default body text |
| Body Small | 14px | 1.5 | 400 | Helper text, captions |
| Label | 14px | 1.5 | 500 | Form labels, UI labels |

### Mobile Typography

On screens smaller than 768px:

| Element | Mobile Size |
|---------|-------------|
| h1 | 36px (2.25rem) |
| h2 | 30px (1.875rem) |
| Body Large | 18px |

## Spacing System

### Scale (8px base unit)

```css
/* Spacing scale based on 8px grid */
--space-1: 4px;   /* 0.25rem */
--space-2: 8px;   /* 0.5rem */
--space-3: 12px;  /* 0.75rem */
--space-4: 16px;  /* 1rem */
--space-5: 20px;  /* 1.25rem */
--space-6: 24px;  /* 1.5rem */
--space-8: 32px;  /* 2rem */
--space-10: 40px; /* 2.5rem */
--space-12: 48px; /* 3rem */
--space-16: 64px; /* 4rem */
--space-20: 80px; /* 5rem */
```

### Common Patterns

- **Component padding**: 16px, 20px, 32px
- **Button padding**: 6-12px vertical, 12-24px horizontal
- **Card spacing**: 20px internal padding
- **Section spacing**: 40-80px vertical margins
- **Grid gaps**: 16px, 24px, 32px

## Component Guidelines

### Buttons

#### Variants

1. **Primary** (`variant="primary"`)
   - Background: `#dc2626`
   - Text: White
   - Use for main actions, CTAs

2. **Secondary** (`variant="secondary"`)
   - Background: `#f3f4f6`
   - Text: `#374151`
   - Use for secondary actions

3. **Outline** (`variant="outline"`)
   - Background: Transparent
   - Border: `#dc2626`
   - Text: `#dc2626`
   - Use for tertiary actions

#### Sizes

- **Small**: 6px/12px padding, 14px font
- **Medium**: 8px/16px padding, 16px font
- **Large**: 12px/24px padding, 18px font

### Cards

#### Variants

1. **Default** (`variant="default"`)
   - Border: 1px solid `#e5e7eb`
   - Background: White

2. **Elevated** (`variant="elevated"`)
   - Box shadow for depth
   - Hover effect increases shadow

3. **Outlined** (`variant="outlined"`)
   - 2px solid border in primary color
   - Use for highlighted content

### Forms

#### Input Fields

- Border: 1px solid `#d1d5db`
- Focus: Border `#dc2626` with subtle shadow
- Error: Border `#dc2626`
- Disabled: Background `#f9fafb`, text `#9ca3af`

#### Labels

- Font weight: 500
- Color: `#374151`
- Margin bottom: 4px

#### Helper Text

- Font size: 14px
- Color: `#6b7280`
- Error text: `#dc2626`

## Layout Principles

### Grid System

- **Container max-width**: 1200px
- **Padding**: 16px mobile, 20px desktop
- **Grid columns**: CSS Grid with `repeat(auto-fit, minmax(280px, 1fr))`

### Responsive Breakpoints

```css
/* Mobile first approach */
@media (max-width: 768px) { /* Mobile */ }
@media (min-width: 769px) { /* Tablet and up */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large desktop */ }
```

### Navigation

- **Height**: 64px
- **Sticky positioning** at top
- **Background**: White with bottom border
- **Mobile**: Responsive text sizing

## Accessibility Guidelines

### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+): Minimum 3:1 contrast ratio
- **Interactive elements**: Clear focus indicators

### Focus Management

- **Focus outline**: 2px solid `#dc2626`
- **Focus offset**: 2px
- **Keyboard navigation**: All interactive elements accessible

### ARIA Labels

- **Form inputs**: Proper labeling and descriptions
- **Buttons**: Descriptive text or aria-label
- **Status messages**: aria-live regions for dynamic content

## Animation & Transitions

### Standard Transitions

```css
/* Default transition */
transition: all 0.2s ease-in-out;

/* Common properties */
transition: color 0.2s ease-in-out;
transition: background-color 0.2s ease-in-out;
transition: border-color 0.2s ease-in-out;
transition: box-shadow 0.2s ease-in-out;
```

### Hover Effects

- **Buttons**: Background color change
- **Cards**: Subtle shadow increase
- **Links**: Color change to hover state

## Icon Usage

### Guidelines

- **Size**: 16px, 20px, 24px standard sizes
- **Color**: Inherit from parent or use gray-500
- **Spacing**: 8px gap from adjacent text
- **Accessibility**: Include alt text or aria-label

### Sources

- Use system icons when available
- SVG format preferred
- Optimize for web delivery

## Best Practices

### CSS Modules

```css
/* Good - Specific class names */
.primaryButton { }
.cardHeader { }
.navigationItem { }

/* Avoid - Generic names */
.button { }
.header { }
.item { }
```

### Component Structure

```tsx
// Good - Clear prop interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
}

// Good - Sensible defaults
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
}) => { ... };
```

### Responsive Design

```css
/* Mobile first approach */
.container {
  padding: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .container {
    padding: 20px;
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Design Tokens

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #dc2626;
  --color-text: #374151;
  --color-text-light: #6b7280;
  --color-border: #e5e7eb;
  --color-background: #ffffff;
  
  /* Spacing */
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

## Implementation Notes

### Storybook Integration

- All components should have stories showing variants
- Include accessibility addon for testing
- Document prop controls and descriptions

### Testing Considerations

- Test responsive behavior at different breakpoints
- Verify color contrast meets WCAG standards
- Test keyboard navigation flows

### Performance

- Use CSS Modules for scoped styling
- Minimize CSS bundle size
- Optimize for critical rendering path
- Use system fonts to reduce font loading time