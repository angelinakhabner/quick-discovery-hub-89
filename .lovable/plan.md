

## Plan: Move dedication text to replace the "Whatsön" logo

Replace the `<h1>Whatsön</h1>` header text (line 157-158) with the dedication text, styled as the app title/branding. The footer dedication (lines 277-284) will be removed.

### Changes in `src/pages/Index.tsx`:
1. **Replace the h1 "Whatsön"** (line 157-158) with the dedication text in the same italic serif style, formatted as the user originally wrote it
2. **Remove the footer dedication** block (lines 277-284)

The dedication will serve as the app's branding/logo text, keeping the same `font-display` styling but with the dedication content instead.

