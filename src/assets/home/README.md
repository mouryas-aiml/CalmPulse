# Home Page Assets

## Current Implementation

Currently, the home page uses inline base64-encoded SVG images for:
1. The hero section background pattern
2. The hero section illustration
3. The testimonials section background pattern
4. The CTA section background pattern

This approach eliminates the need for external image files during development. The base64 strings are defined directly in the `src/pages/Home.js` file.

## For Production

For a production environment, consider replacing the base64 placeholders with actual image files:

1. Add high-quality background images to this folder with names like:
   - `hero-bg.jpg` - Background for the hero section
   - `cta-bg.jpg` - Background for the CTA section
   - `hero-illustration.png` - Main hero illustration

2. Update the imports in `src/pages/Home.js` to use these actual image files instead of base64 strings.

## Image Guidelines

### Background Images
- Use high-resolution images (at least 1920px width)
- Choose images that work well with overlay gradients
- Subtle patterns or blurred imagery works best
- Ensure good contrast with white text

### Hero Illustration
- Use a transparent PNG for best results
- Size around 600x400px minimum
- Should visually represent mental wellness, mindfulness, or support
- Professional, calming imagery that aligns with the app's purpose

## Implementation Notes

The current CSS uses a gradient overlay on top of the background images to ensure text readability and consistent branding. When replacing with actual images, maintain this approach for visual consistency. 