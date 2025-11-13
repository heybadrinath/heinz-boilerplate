# PWA Icons

This directory should contain the PWA icons referenced in `manifest.json`.

## Required Icons

Generate the following icon sizes from your main app icon:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Icon Generation Tools

You can use online tools like:
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [Favicon Generator](https://realfavicongenerator.net/)
- [App Manifest Generator](https://app-manifest.firebaseapp.com/)

## Design Guidelines

- Use a simple, recognizable icon
- Ensure it works well at small sizes
- Consider the maskable icon format for Android adaptive icons
- Use your brand colors (primary red: #dc2626)

## Adding Real Icons

1. Generate your icons using the tools above
2. Replace the placeholder files in this directory
3. Update the manifest.json if you change sizes or add new formats
4. Test on various devices and browsers