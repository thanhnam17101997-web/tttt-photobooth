# Source audit — 2026-11-17

## Read-only references

| Source | Revision inspected | Evidence | Reuse decision |
|---|---|---|---|
| Boothlev | `86eb0c185ef477a21a704102778a737cc848b5ae` | `frontend/src/app/editor/page.js`, `frontend/src/store/useStore.js`, `frontend/package.json` | No source code, assets, fonts or audio copied. |
| TTTT invitation | `0a9324410afb4dae4b14884ad071d63d4dfbdb83` | `src/style.css`, `index.html`, `src/typography.ts`, `ASSET_MANIFEST.md` | Design-language reference only. No invitation source, images, logo, font binary, Three.js or Supabase code copied. |

## Boothlev findings

- Root repository has no `LICENSE` or `COPYING` file at the inspected revision. Public availability does not grant reuse. Its source and bundled assets are therefore excluded from this app.
- `frontend/src/app/editor/page.js` has a `DraggableSticker` using pointer down and window-level pointer move/up. It translates pointer delta by a preview scale factor; `-` / `+` buttons resize and a hover-only delete control removes the sticker.
- It uses `html-to-image` to export an editor DOM element at `pixelRatio: 3`, not an explicit native photo-coordinate export.
- `frontend/src/store/useStore.js` persists `stickers` through Zustand local storage. This V1 keeps photos and edits in memory to avoid retaining visitor data.
- `frontend/package.json` declares Next 16, React 19, Zustand, `html-to-image`, `html2canvas`, and `@use-gesture/react`. No dependency or code from Boothlev was installed here.
- Its inspected interaction does not prove two-finger pinch/rotation. This app implements those gestures independently in `src/components/PhotoStage.tsx`.

## Invitation token audit

The final relevant styles are in the lower cascade of `src/style.css`, particularly stage-ribbon and `.btn-open-invite` rules around lines 1020–1067.

- Font: `Be Vietnam Pro` for readable UI (the source imports it from Google Fonts). This app loads the same public web font; no local font binary is copied.
- Stage palette: `#253879 → #11194d → #070b2c` radial background; original root tokens also include deep plum `#130524`, rich purple `#1f0b3b`, and white primary text.
- Surfaces: soft pink/cream translucent cards, strong roundness, white highlight/inset shadow.
- CTA: cream/pink gradient with a soft gloss, asymmetric organic edge, pink depth shadow. Recreated as original CSS for the local Save action.
- Motion: only low-amplitude decorative ribbon movement, disabled under `prefers-reduced-motion`; decorations have `pointer-events:none`.

## Chosen implementation

- Vite + React + TypeScript, intentionally separate from the two reference repos.
- Immutable image-native sticker positions. Canvas preview and export use the original image pixel dimensions; CSS only scales the canvas for the device.
- Original canvas-drawn starter stickers (star, heart, flower, sparkle, smile) avoid third-party artwork. `TTTT` is an explicitly empty future pack.
- Local files and Cloudinary delivery URLs are supported. Remote source is loaded once into memory; canvas export requires Cloudinary CORS headers.
- The future QR/session resolver boundary is deliberately absent. No QR, Godot, Cloudinary upload/delete, backend, analytics, or persistence is included.
