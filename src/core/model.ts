export type StickerKind = 'star' | 'heart' | 'flower' | 'sparkle' | 'smile' | 'emoji' | 'custom' | 'sprite';
export type SpriteRect = { x: number; y: number; width: number; height: number };
export type Sticker = { id: string; kind: StickerKind; x: number; y: number; scale: number; rotationDeg: number; zIndex: number; imageUrl?: string; emoji?: string; sourceRect?: SpriteRect };
export type Photo = { url: string; image: HTMLImageElement; width: number; height: number; name: string; revoke?: boolean };
export type EditorState = { stickers: Sticker[]; selectedId: string | null };

export const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));
const stickerId = () => globalThis.crypto?.randomUUID?.() ?? `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export const makeSticker = (kind: StickerKind, width: number, height: number, imageUrl?: string, emoji?: string, sourceRect?: SpriteRect): Sticker => ({
  id: stickerId(), kind, imageUrl, emoji, sourceRect, x: width / 2, y: height / 2, scale: Math.max(0.42, Math.min(width, height) / 950), rotationDeg: 0, zIndex: Date.now(),
});
export const replaceSticker = (stickers: Sticker[], next: Sticker) => stickers.map((s) => s.id === next.id ? next : s);
