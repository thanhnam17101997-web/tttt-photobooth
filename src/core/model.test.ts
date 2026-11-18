import { afterEach, describe, expect, it } from 'vitest';
import { clamp, makeSticker, replaceSticker } from './model';
const browserCrypto = globalThis.crypto;
afterEach(()=>Object.defineProperty(globalThis,'crypto',{value:browserCrypto,configurable:true}));
describe('editor model',()=>{it('starts a sticker at image centre, independent of CSS dimensions',()=>{const s=makeSticker('star',1600,900);expect([s.x,s.y]).toEqual([800,450]);});it('replaces only the edited sticker',()=>{const a=makeSticker('star',10,10),b=makeSticker('heart',10,10);expect(replaceSticker([a,b],{...a,x:4})).toEqual([{...a,x:4},b]);});it('keeps gesture scale in a safe range',()=>expect(clamp(8,.12,4)).toBe(4));it('creates a sticker over LAN HTTP when randomUUID is unavailable',()=>{Object.defineProperty(globalThis,'crypto',{value:{},configurable:true});expect(makeSticker('star',100,100).id).toMatch(/^sticker-/);});});
