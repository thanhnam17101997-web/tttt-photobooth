import { useEffect, useMemo, useRef, useState } from 'react';
import { drawSticker } from '../core/draw';
import { clamp, type Photo, type Sticker } from '../core/model';

type Props = { photo: Photo; stickers: Sticker[]; selectedId: string | null; onSelect: (id: string | null) => void; onChange: (sticker: Sticker, committed: boolean) => void; customImages: Map<string, HTMLImageElement>; imageVersion: number; onDelete: () => void };
type Point = { x: number; y: number };
const distance = (a: Point,b: Point) => Math.hypot(a.x-b.x,a.y-b.y);
const angle = (a: Point,b: Point) => Math.atan2(b.y-a.y,b.x-a.x) * 180 / Math.PI;

export function PhotoStage({ photo, stickers, selectedId, onSelect, onChange, customImages, imageVersion, onDelete }: Props) {
  const stageRef = useRef<HTMLDivElement>(null); const canvasRef = useRef<HTMLCanvasElement>(null); const pointers = useRef(new Map<number, Point>()); const start = useRef<{ sticker: Sticker; points: Point[] } | null>(null);
  const [canvasSize,setCanvasSize]=useState({width:0,height:0,left:0,top:0});
  const [isDragging,setDragging]=useState(false);
  const selected = stickers.find((item) => item.id === selectedId) ?? null;
  const dimensions = useMemo(() => ({ width: photo.width, height: photo.height }), [photo]);
  useEffect(() => {
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx)return;
    canvas.width=photo.width; canvas.height=photo.height;
    const render=()=>{ctx.clearRect(0,0,photo.width,photo.height);ctx.drawImage(photo.image,0,0,photo.width,photo.height);[...stickers].sort((a,b)=>a.zIndex-b.zIndex).forEach(s=>drawSticker(ctx,s,180,customImages.get(s.id)));};
    render();
    const pending=[...customImages.values()].filter(image=>!image.complete || !image.naturalWidth);
    pending.forEach(image=>image.addEventListener('load',render,{once:true}));
    return()=>pending.forEach(image=>image.removeEventListener('load',render));
  }, [photo, stickers, selected, customImages, imageVersion]);
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const updateSize=()=>{const rect=canvas.getBoundingClientRect();const stage=stageRef.current?.getBoundingClientRect();setCanvasSize({width:rect.width,height:rect.height,left:stage?rect.left-stage.left:0,top:stage?rect.top-stage.top:0});};updateSize();const observer=new ResizeObserver(updateSize);observer.observe(canvas);return()=>observer.disconnect();},[photo]);
  const point = (e: React.PointerEvent): Point => { const r=canvasRef.current!.getBoundingClientRect(); return { x:(e.clientX-r.left)*dimensions.width/r.width, y:(e.clientY-r.top)*dimensions.height/r.height }; };
  const closest = (p:Point) => [...stickers].sort((a,b)=>b.zIndex-a.zIndex).find(s=>distance(p,{x:s.x,y:s.y}) < 115*s.scale);
  const contain=(sticker:Sticker)=>{const maxScale=Math.min(4,photo.width/270,photo.height/270);const scale=clamp(sticker.scale,.12,maxScale);const overflow=132*scale;return {...sticker,scale,x:clamp(sticker.x,-overflow,photo.width+overflow),y:clamp(sticker.y,-overflow,photo.height+overflow)};};
  const update = (committed=false) => { const active=start.current;if(!active)return; const current=[...pointers.current.values()]; if(!current.length)return; const s=active.sticker; let next={...s}; if(current.length===1 || active.points.length===1){next.x=s.x+(current[0].x-active.points[0].x);next.y=s.y+(current[0].y-active.points[0].y);} else {const initialMid={x:(active.points[0].x+active.points[1].x)/2,y:(active.points[0].y+active.points[1].y)/2};const nowMid={x:(current[0].x+current[1].x)/2,y:(current[0].y+current[1].y)/2};next.x=s.x+nowMid.x-initialMid.x;next.y=s.y+nowMid.y-initialMid.y;next.scale=s.scale*distance(current[0],current[1])/distance(active.points[0],active.points[1]);next.rotationDeg=s.rotationDeg+angle(current[0],current[1])-angle(active.points[0],active.points[1]);} onChange(contain(next), committed); };
  const down=(e:React.PointerEvent)=>{e.preventDefault(); const p=point(e);pointers.current.set(e.pointerId,p); if(pointers.current.size===2&&start.current){const active=stickers.find(s=>s.id===start.current!.sticker.id)??start.current.sticker;start.current={sticker:active,points:[...pointers.current.values()]};setDragging(true);(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);return;} const hit=closest(p); if(!hit){pointers.current.delete(e.pointerId);onSelect(null);setDragging(false);return;} onSelect(hit.id);setDragging(true);start.current={sticker:hit,points:[...pointers.current.values()]};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);};
  const move=(e:React.PointerEvent)=>{if(!pointers.current.has(e.pointerId))return;pointers.current.set(e.pointerId,point(e));update();};
  const isTrashDrop=(e:React.PointerEvent)=>pointers.current.size===1&&e.clientY>window.innerHeight-108&&Math.abs(e.clientX-window.innerWidth/2)<180;
  const up=(e:React.PointerEvent)=>{if(!pointers.current.has(e.pointerId))return;const shouldDelete=isTrashDrop(e);if(!shouldDelete)update(true);pointers.current.delete(e.pointerId);if(shouldDelete){onDelete();onSelect(null);}if(pointers.current.size===1&&start.current){start.current={sticker:stickers.find(s=>s.id===start.current!.sticker.id)??start.current.sticker,points:[...pointers.current.values()]};}else if(!pointers.current.size){start.current=null;setDragging(false);}};
  const cancel=(e:React.PointerEvent)=>{pointers.current.delete(e.pointerId);if(!pointers.current.size){start.current=null;setDragging(false);}};
  const trashStyle={left:`${canvasSize.left+canvasSize.width/2}px`,top:`${canvasSize.top+canvasSize.height-18}px`};
  return <div ref={stageRef} className="stage-wrap"><canvas aria-label="Khoảnh khắc đang được trang trí" ref={canvasRef} className="photo-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}/>{isDragging&&<div className="trash-drop" style={trashStyle} aria-label="Xoá sticker"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7l1-2h4l1 2m-8 0 1 13h8l1-13"/></svg></div>}</div>;
}
