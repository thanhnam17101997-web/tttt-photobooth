import { drawSticker } from './draw';
import type { Photo, Sticker } from './model';

export async function exportPng(photo: Photo, stickers: Sticker[], customImages: Map<string, HTMLImageElement>): Promise<Blob> {
  const canvas = document.createElement('canvas'); canvas.width = photo.width; canvas.height = photo.height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Không tạo được vùng xuất ảnh.');
  ctx.drawImage(photo.image, 0, 0, photo.width, photo.height);
  [...stickers].sort((a,b)=>a.zIndex-b.zIndex).forEach((s) => drawSticker(ctx, s, 180, customImages.get(s.id)));
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Trình duyệt không xuất được PNG.')), 'image/png'));
}
