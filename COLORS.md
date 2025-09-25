# Citypass+ Brand Colors

This document outlines the standardized color palette for the Citypass+ project.

## Brand Colors

### Primary Colors
- **Primary**: `#04BF8A` - Main brand color for primary actions and highlights
- **Secondary**: `#03A64A` - Secondary brand color for supporting elements
- **Dark**: `#025940` - Dark brand color for accents and emphasis

### Base Colors
- **White**: `#FFFFFF` - Background and card colors
- **Light Grey**: `#F5F5F5` - Muted backgrounds and borders

## Usage in Tailwind CSS

### Brand Colors
```css
bg-brand-primary     /* #04BF8A */
bg-brand-secondary   /* #03A64A */
bg-brand-dark        /* #025940 */
text-brand-primary   /* Text in primary color */
text-brand-secondary /* Text in secondary color */
text-brand-dark      /* Text in dark color */
border-brand-primary /* Border in primary color */
```

### UI Colors (shadcn/ui compatible)
```css
bg-primary          /* Uses brand-primary */
bg-secondary        /* Uses brand-secondary */
bg-accent           /* Uses brand-dark */
bg-muted            /* Light grey */
text-muted-foreground /* Darker grey for text */
```

## Color Mapping

| Purpose | Brand Color | Tailwind Class | Hex Value |
|---------|-------------|----------------|-----------|
| Primary Actions | Primary | `bg-brand-primary` | `#04BF8A` |
| Secondary Actions | Secondary | `bg-brand-secondary` | `#03A64A` |
| Accents/Highlights | Dark | `bg-brand-dark` | `#025940` |
| Backgrounds | White | `bg-background` | `#FFFFFF` |
| Muted Elements | Light Grey | `bg-muted` | `#F5F5F5` |

## Dark Mode Support

All brand colors remain consistent in dark mode, while base colors adapt:
- Background becomes dark (`#141414`)
- Text becomes light (`#F5F5F5`)
- Cards become dark grey (`#1F1F1F`)

## Examples

### Buttons
```jsx
// Primary button
<Button className="bg-brand-primary hover:bg-brand-primary/90">
  Primary Action
</Button>

// Secondary button
<Button className="bg-brand-secondary hover:bg-brand-secondary/90">
  Secondary Action
</Button>

// Outline button
<Button variant="outline" className="border-brand-primary text-brand-primary">
  Outline Action
</Button>
```

### Cards
```jsx
// Card with brand accent
<Card className="border-brand-primary">
  <CardHeader>
    <CardTitle className="text-brand-primary">Featured</CardTitle>
  </CardHeader>
</Card>
```
