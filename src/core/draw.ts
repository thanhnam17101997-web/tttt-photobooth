import type { Sticker, StickerKind } from './model';

const colors: Record<Exclude<StickerKind, 'custom' | 'emoji' | 'sprite'>, [string, string, string]> = {
  star: ['#fff8b6', '#ffcc39', '#b56b12'], heart: ['#ffd6e8', '#ff5f9d', '#b81b61'], flower: ['#f7ddff', '#b77ce5', '#6b3f9f'], sparkle: ['#d7fff2', '#62d7bd', '#19877b'], smile: ['#fff6d1', '#ffc43d', '#bd7111'],
};

export function drawSticker(ctx: CanvasRenderingContext2D, sticker: Sticker, size: number, image?: HTMLImageElement) {
  ctx.save(); ctx.translate(sticker.x, sticker.y); ctx.rotate(sticker.rotationDeg * Math.PI / 180); ctx.scale(sticker.scale, sticker.scale);
  if (sticker.kind === 'custom' && image) { ctx.drawImage(image, -size / 2, -size / 2, size, size); ctx.restore(); return; }
  if (sticker.kind === 'sprite' && image) {
    if (sticker.sourceRect) { const r = sticker.sourceRect; ctx.drawImage(image, r.x, r.y, r.width, r.height, -size / 2, -size / 2, size, size); }
    else { const ratio = Math.min(size / image.naturalWidth, size / image.naturalHeight); const width = image.naturalWidth * ratio; const height = image.naturalHeight * ratio; ctx.drawImage(image, -width / 2, -height / 2, width, height); }
    ctx.restore(); return;
  }
  if (sticker.kind === 'emoji') { ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sticker.emoji ?? '✨', 0, 3); ctx.restore(); return; }
  const [top, mid, edge] = colors[sticker.kind === 'custom' || sticker.kind === 'sprite' ? 'star' : sticker.kind];
  const g = ctx.createRadialGradient(-size * .16, -size * .23, size * .04, 0, 0, size * .62); g.addColorStop(0, top); g.addColorStop(.62, mid); g.addColorStop(1, edge);
  ctx.fillStyle = g; ctx.strokeStyle = 'rgba(255,255,255,.58)'; ctx.lineWidth = 3;
  ctx.beginPath();
  if (sticker.kind === 'heart') { ctx.moveTo(0, size*.42); ctx.bezierCurveTo(-size*.85, -size*.1, -size*.38, -size*.58, 0, -size*.22); ctx.bezierCurveTo(size*.38, -size*.58, size*.85, -size*.1, 0, size*.42); }
  else if (sticker.kind === 'flower') { for (let i=0;i<16;i++){const a=i*Math.PI/8, r=i%2?size*.23:size*.52; i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);} ctx.closePath(); }
  else if (sticker.kind === 'sparkle') { ctx.moveTo(0,-size*.56);ctx.lineTo(size*.14,-size*.14);ctx.lineTo(size*.56,0);ctx.lineTo(size*.14,size*.14);ctx.lineTo(0,size*.56);ctx.lineTo(-size*.14,size*.14);ctx.lineTo(-size*.56,0);ctx.lineTo(-size*.14,-size*.14);ctx.closePath(); }
  else if (sticker.kind === 'star') { for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?size*.23:size*.55;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath(); }
  else { ctx.arc(0,0,size*.48,0,Math.PI*2); }
  ctx.fill(); ctx.stroke();
  ctx.globalAlpha=.6; ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-size*.15,-size*.21,size*.16,size*.07,-.45,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  if(sticker.kind==='smile'){ctx.fillStyle='#542d49';ctx.beginPath();ctx.arc(-size*.16,-size*.06,size*.045,0,7);ctx.arc(size*.16,-size*.06,size*.045,0,7);ctx.strokeStyle='#542d49';ctx.lineWidth=size*.055;ctx.beginPath();ctx.arc(0,size*.06,size*.2,.1,Math.PI-.1);ctx.stroke();}
  ctx.restore();
}
