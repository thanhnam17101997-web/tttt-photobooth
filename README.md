# TTTT Photo Playground

Standalone, client-only mobile photo sticker editor. It accepts a local image or a Cloudinary delivery URL, lets the visitor place / drag / pinch / rotate stickers, then exports a full-resolution PNG locally.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local development URL. For a phone on the same Wi-Fi, run:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the LAN URL that Vite prints. For a remote test, append a public Cloudinary delivery URL:

```text
http://localhost:5173/?image=https%3A%2F%2Fres.cloudinary.com%2F...%2Fimage.jpg
```

Use a local file if the remote image does not return CORS headers. The app never uploads the original or edited image.

## Checks

```bash
npm run test
npm run build
```

## Controls

- Tap a tray sticker to add it.
- Tap the animated sticker bubble to open the sticker sheet.
- Tap a sticker to add it, then drag it with one finger.
- Add a second finger anywhere on the photo while dragging the sticker to resize and rotate it.
- Drag a sticker to the trash bubble at the bottom to remove it.
- The gold download bubble uses Web Share with an image file when supported (iOS Safari / Android Chrome); otherwise it downloads a PNG.

## Boundaries

This is deliberately isolated from Godot, the existing QR download flow, production Cloudinary credentials, Supabase, and seven-day deletion. A later session resolver should provide `{ sessionId, imageUrl, expiresAt }` to this UI without changing its editor core. See `AUDIT_RESULTS.md` for source and license findings.
