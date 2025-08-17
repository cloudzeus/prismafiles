# Aceternity UI Components

This directory contains beautiful, interactive UI components inspired by Aceternity UI. These components are built with Framer Motion, Tailwind CSS, and React.

## Available Components

### 1. Card3DEffect
A 3D interactive card that responds to mouse movement with rotation and scaling effects.

```tsx
import { Card3DEffect } from "@/components/ui/aceternity";

<Card3DEffect>
  <div className="text-center">
    <h3>Interactive 3D Card</h3>
    <p>Move your mouse over this card to see the 3D effect!</p>
  </div>
</Card3DEffect>
```

### 2. BackgroundBeams
Creates an interactive background with animated beams that follow mouse movement.

```tsx
import { BackgroundBeams } from "@/components/ui/aceternity";

<BackgroundBeams className="min-h-screen">
  <div>Your content here</div>
</BackgroundBeams>
```

### 3. CardHoverEffect
A card with a spotlight effect that follows the mouse cursor on hover.

```tsx
import { CardHoverEffect } from "@/components/ui/aceternity";

<CardHoverEffect>
  <div className="text-center">
    <h3>Hover to Reveal</h3>
    <p>Hover over this card to see the spotlight effect!</p>
  </div>
</CardHoverEffect>
```

### 4. FloatingNavbar
A floating navigation bar with smooth animations and active state indicators.

```tsx
import { FloatingNavbar } from "@/components/ui/aceternity";

const navbarItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

<FloatingNavbar items={navbarItems} />
```

### 5. Meteors
Creates a shooting stars effect with animated meteors streaking across the screen.

```tsx
import { Meteors } from "@/components/ui/aceternity";

<div className="relative h-64 w-full">
  <Meteors number={30} />
  <div className="relative z-10">
    Your content here
  </div>
</div>
```

### 6. Sparkles
Adds animated sparkles around any content.

```tsx
import { Sparkles } from "@/components/ui/aceternity";

<Sparkles sparklesCount={20}>
  <div>✨ This text has sparkles! ✨</div>
</Sparkles>
```

### 7. AnimatedModal
A beautiful modal with spring animations and backdrop blur.

```tsx
import { AnimatedModal } from "@/components/ui/aceternity";

const [isOpen, setIsOpen] = useState(false);

<AnimatedModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  <div>Modal content here</div>
</AnimatedModal>
```

## Dependencies

These components require the following packages:
- `framer-motion` - For animations
- `lucide-react` - For icons
- `clsx` - For conditional class names
- `tailwind-merge` - For merging Tailwind classes

## Customization

All components accept a `className` prop for additional styling. You can customize:
- Colors by modifying the Tailwind classes
- Animations by adjusting the Framer Motion properties
- Sizes by changing the default dimensions

## Usage Examples

See `/components` page for live examples of all components in action.

## Performance

These components are optimized for performance:
- Animations use `transform` properties for GPU acceleration
- Event listeners are properly cleaned up
- Components use React.memo where appropriate
- Animations are throttled to prevent excessive re-renders
