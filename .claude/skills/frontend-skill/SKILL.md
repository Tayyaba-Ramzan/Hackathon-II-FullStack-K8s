---
name: frontend-skill
description: Build pages, reusable components, layouts, and styling for modern web applications.
---

# Frontend Skill

## Instructions

1. **Page & Layout Structure**
   - Design responsive pages for different screen sizes  
   - Use modern layout techniques (Flexbox, Grid)  
   - Maintain consistent spacing, alignment, and hierarchy  
   - Organize page content into logical sections  

2. **Component Development**
   - Build reusable and modular components  
   - Pass data via props and manage state effectively  
   - Ensure components are composable and maintainable  
   - Use component libraries or design systems if available  

3. **Styling**
   - Apply consistent styling using CSS, Tailwind, or CSS-in-JS  
   - Follow design system guidelines and theme tokens  
   - Support responsive and adaptive styling  
   - Implement hover, focus, and active states for interactive elements  

4. **Visual Elements**
   - Add images, icons, and media appropriately  
   - Use animations or transitions to enhance UX  
   - Maintain accessibility (a11y) for all visual elements  

## Best Practices
- Keep components small and reusable  
- Avoid inline styles when possible  
- Ensure semantic HTML structure  
- Follow mobile-first design principles  
- Test components in different browsers and devices  

## Example Structure

```tsx
// Next.js Page Example
import Button from "@/components/Button";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-600">
      <h1 className="text-4xl font-bold text-white animate-fade-in">
        Welcome to Our App
      </h1>
      <p className="mt-4 text-white animate-fade-in-delay">
        Build beautiful UIs effortlessly
      </p>
      <Button className="mt-6">Get Started</Button>
    </section>
  );
}