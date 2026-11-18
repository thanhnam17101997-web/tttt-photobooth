# Design QA — TTTT Photo Playground

## Comparison target and evidence

- Source visual truth: `/Users/x/Documents/Codex/2026-11-02/TING-TING-STARLAKE/.references/tttt-invitation-l10/references/approved-3-screen-direction.png` (1668 × 944, three mobile compositions).
- Implementation: browser-rendered local editor at `http://127.0.0.1:5173/?image=http%3A%2F%2F127.0.0.1%3A5173%2Ftest-photo.svg`, current photo-editor state, captured 2026-11-18. Browser console: no errors/warnings.
- Comparison scope: this is an editor, not a duplicate invitation. The test photo/canvas and sticker tray are intentional product differences; the comparison evaluates the shared TTTT visual language.

## Comparison history

1. Initial editor: fixed Save/status overlaid the sticker tray; generic title, neutral controls and no official brand artwork. **P1/P2 blocked.**
2. Fix: moved Save/status into flow; rewrote human-facing copy; changed shell to deep plum, cream organic card, glossy yellow CTA and candy tray; imported official logo and supplied decorative artwork read-only from invitation source.
3. First post-fix capture: official logo was visually too small to establish the brand. **P1 blocked.**
4. Fix: enlarged header logo to 144 × 58 CSS px and retained the invitation's dark-plum / cream / yellow hierarchy.

## Fidelity surfaces

- **Typography:** Be Vietnam Pro remains the readable UI face used by the invitation. The official wordmark is now an image rather than improvised display type. The copy is short, colloquial and visitor-facing; it no longer describes implementation mechanics.
- **Layout rhythm:** Mobile single-column frame with photo first, low-emphasis edit corrections, then the candy tray and one yellow exit CTA. No sticky/fixed overlap remains.
- **Color tokens:** Deep plum stage, cream/pink organic cards, a warm yellow primary action and pink/lilac accents map to the supplied invitation direction.
- **Image and asset fidelity:** Official `logo-white.png`, `element-7.png` and `coin.png` are imported from the read-only invitation reference and bundled into this standalone build. User photos remain unchanged. Emoji stickers are intentionally an interim functional library, not represented as final TTTT illustration assets.
- **Copy/content:** `Giữ lại một chút ting ting`, `Chọn món đồ hợp với hôm nay của mày`, and `Mang ảnh về` support the agreed feeling: worthwhile to keep, still playful.

## Findings

- No actionable P0/P1/P2 visual issues in the tested editor state.
- [P3] The temporary emoji packs remain visually less specific than TTTT's art direction. They are functional content coverage only; replace them with a future approved TTTT asset pack without changing the editor engine.

## Implementation checklist

- [x] Human-facing copy replaces technical/status copy.
- [x] Official TTTT identity appears in the editor shell.
- [x] Photo remains the visual hero; export pixels remain unchanged.
- [x] Sticker tray and Save affordance are separate, non-overlapping regions.
- [x] Build/test/browser console pass.

final result: passed
