# Doctor Images for Therapist Cards

## Current Implementation

Currently, the application is using inline base64-encoded SVG images as placeholders for the therapist profile pictures. This approach eliminates the need for external image files while development is in progress.

## For Production

For a production environment, you should replace the base64 placeholders in the code with actual image files:

1. Add professional doctor images to this folder with the following names:
   - `dr_sharma.jpg` - Image for Dr. Priya Sharma
   - `dr_menon.jpg` - Image for Dr. Arjun Menon
   - `dr_desai.jpg` - Image for Dr. Sneha Desai
   - `dr_kapoor.jpg` - Image for Dr. Vikram Kapoor
   - `dr_nair.jpg` - Image for Dr. Lakshmi Nair
   - `dr_singh.jpg` - Image for Dr. Rajiv Singh
   - `placeholder.jpg` - A default placeholder image for therapists

2. Update the imports in `src/pages/Therapists.js` to use the actual image files instead of base64 strings.

## Image Guidelines

- Use professional headshot-style images
- Recommended size: 500x500 pixels minimum
- Square aspect ratio preferred
- Professional attire and neutral background
- Clear facial features
- High quality and good lighting

## Fallback Mechanism

The application includes a fallback mechanism that will generate an avatar based on the therapist's name if the specified image fails to load. This ensures that users will always see some visual representation of the therapist, even if the actual image is unavailable. 