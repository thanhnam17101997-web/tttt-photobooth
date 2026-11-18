# Acceptance report — initial implementation

Build evidence must identify device/browser and committed source before calling a checkbox PASS. Automated build and model checks are run separately; physical iPhone Safari / Android Chrome execution remains required.

## Executed local browser check

- Environment: local Vite dev server at `http://127.0.0.1:5173`, in-app browser, 2026-11-17.
- Source: `public/test-photo.svg`, 1200 × 900. This is a synthetic fixture, not a visitor photo or Cloudinary resource.
- Observed: photo loaded, star and heart were added, undo/redo restored history, canvas selection rendered, PNG export reached the browser share affordance, and the console had no warning/error entries.
- This is a functional desktop-browser proof only. It is not a substitute for a physical Safari/Chrome touch test.

| Area | Status | Evidence / limitation |
|---|---|---|
| Local file input | Implemented | Browser `File` → in-memory object URL, no upload. Needs physical-device check. |
| Cloudinary URL input | Implemented | Limited to `res.cloudinary.com`; requires delivery CORS headers for canvas export. A supplied real permitted URL was not available, so not marked PASS. |
| Sticker add/drag/pinch/rotate/delete | Implemented | Original pointer-event engine in `src/components/PhotoStage.tsx`; needs physical iOS and Android gesture run. |
| Undo/redo/reset | Implemented | Bounded 40 snapshots; reset confirmation gives an undo route. |
| Native-resolution PNG | Implemented | `src/core/export.ts` canvas is set to `photo.width × photo.height`; functional browser export still needs device evidence. |
| Responsive / safe area / reduced motion | Implemented | CSS uses `svh`, safe-area insets, 320 px minimum and reduced-motion media query. Needs browser matrix test. |
| TTTT custom slot | Implemented | Present and intentionally empty until approved assets arrive. |
| Godot / QR / Cloudinary write path | Not touched | Outside this project. |
| Seven-day deletion / resolver | Not built | Explicitly future integration only. |

## Required manual completion

- Test on real iPhone Safari and Android Chrome: add 10 stickers, drag, pinch/rotate, save/share twice.
- Test a real permitted Cloudinary delivery URL and record dimensions, CORS outcome, fetch count, console errors and screenshots.
- Compare exported PNG dimensions with the selected original image; place stickers near all four corners.
- Check 320, 360, 390 and 430 CSS-pixel widths plus landscape and small-height viewports.
