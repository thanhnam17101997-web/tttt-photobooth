import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PhotoStage } from './components/PhotoStage';
import { exportPng } from './core/export';
import { makeSticker, replaceSticker, type EditorState, type Photo, type SpriteRect, type Sticker, type StickerKind } from './core/model';

type CatalogSticker = { kind: StickerKind; label: string; emoji?: string; imageUrl?: string; sourceRect?: SpriteRect };
const gridSticker = (sheet: number, index: number, label: string): CatalogSticker => ({
  kind: 'sprite', label, imageUrl: `/stickers-clean/s${String(sheet).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}.png`,
});
const customPack = (id: string, label: string, sheet: number, names: readonly string[]) => ({ id, label, stickers: names.map((name, index) => gridSticker(sheet, index, name)) });
const packs: { id: string; label: string; stickers: CatalogSticker[] }[] = [
  customPack('carry', 'Mang theo', 1, ['Xu sao', 'Hoá đơn', 'Thẻ hồng', 'Ví tím', 'Heo đất', 'Máy tính', 'Móc tim', 'Hũ dành dụm', 'Thư tim', 'Túi hồng']),
  customPack('save', 'Cất dành', 2, ['Tiền hồng', 'Máy tính tiền', 'Túi nhỏ', 'Hoá đơn tim', 'Giỏ mua sắm', 'Sổ tiết kiệm', 'Chìa khoá', 'Quà', 'Vé', 'Cửa hàng']),
  customPack('play', 'Số má', 3, ['Xu sao', 'Phong bì', 'Sổ tính', 'Hộp tiết kiệm', 'Máy kẹo', 'Tách xu', 'Két tim', 'Cân', 'Máy bay giấy', 'Ngân hàng trăng']),
  customPack('lucky', 'Lấy hên', 4, ['Ví xu', 'Két sao', 'Viên xu', 'Thẻ đóng dấu', 'Phiếu quà', 'Sổ điều ước', 'Máy gắp', 'Ô xu', 'Băng cassette', 'Cỏ bốn lá']),
];
const stickerToolPreviews = ['/stickers-clean/s01-01.png', '/stickers-clean/s01-04.png', '/stickers-clean/s01-10.png', '/stickers-clean/s03-09.png'];
const allowedHost = (url: string) => { try { const host = new URL(url).hostname; return host === 'res.cloudinary.com' || host === location.hostname; } catch { return false; } };
const initial: EditorState = { stickers: [], selectedId: null };
function loadImage(url: string, name: string, revoke = false): Promise<Photo> { return new Promise((resolve, reject) => { const image = new Image(); image.crossOrigin = 'anonymous'; image.onload = () => resolve({ url, image, width: image.naturalWidth, height: image.naturalHeight, name, revoke }); image.onerror = () => reject(new Error('Không tải được ảnh.')); image.src = url; }); }

export default function App() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [state, setState] = useState<EditorState>(initial);
  const [history, setHistory] = useState<EditorState[]>([initial]);
  const [position, setPosition] = useState(0);
  const [url, setUrl] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const isQrFlow = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(new URLSearchParams(window.location.search).get('image'));
  }, []);
  const [message, setMessage] = useState('Chọn một tấm ảnh, rồi thêm chút ting ting của mày vào đó.');
  const [exporting, setExporting] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [isStickerSheetOpen, setStickerSheetOpen] = useState(false);
  const [stickerPreview, setStickerPreview] = useState(0);
  const customImages = useRef(new Map<string, HTMLImageElement>());
  const fileRef = useRef<HTMLInputElement>(null);
  const stickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('image');
    if (query && allowedHost(query)) {
      setUrl(query);
      void openUrl(query);
    } else if (query) {
      setLoadError('Link ảnh không đúng định dạng Cloudinary.');
    }
  }, []);

  useEffect(() => () => { if (photo?.revoke) URL.revokeObjectURL(photo.url) }, [photo]);

  useEffect(() => {
    if (!photo || isStickerSheetOpen) return;
    setStickerPreview(0);
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      setStickerPreview(frame % stickerToolPreviews.length);
      if (frame === 5) window.clearInterval(timer);
    }, 650);
    return () => window.clearInterval(timer);
  }, [photo, isStickerSheetOpen]);

  const commit = useCallback((next: EditorState) => {
    setState(next);
    setHistory(h => [...h.slice(0, position + 1), next].slice(-40));
    setPosition(p => Math.min(p + 1, 39));
  }, [position]);

  const openUrl = async (value = url) => {
    setLoadError(null);
    if (!allowedHost(value)) {
      setLoadError('Link ảnh không hợp lệ.');
      return;
    }
    try {
      const p = await loadImage(value, 'Cloudinary photo');
      setPhoto(p);
      setState(initial);
      setHistory([initial]);
      setPosition(0);
    } catch (e) {
      setLoadError('Mạng hơi yếu một chút xíu, bấm thử lại để tải ảnh nhé!');
    }
  };

  const choosePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Chọn một file ảnh nhé.');
      return;
    }
    try {
      const p = await loadImage(URL.createObjectURL(file), file.name, true);
      setPhoto(p);
      setState(initial);
      setHistory([initial]);
      setPosition(0);
      setMessage('Tấm ảnh này sẵn sàng để nghịch rồi.');
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const add = (kind: StickerKind, imageUrl?: string, emoji?: string, sourceRect?: SpriteRect) => {
    if (!photo) return;
    const s = makeSticker(kind, photo.width, photo.height, imageUrl, emoji, sourceRect);
    if (imageUrl) {
      const image = new Image();
      image.onload = () => setImageVersion(version => version + 1);
      image.onerror = () => setMessage('Sticker này chưa tải được. Bấm thử lại nhé.');
      image.src = imageUrl;
      customImages.current.set(s.id, image);
    }
    commit({ stickers: [...state.stickers, s], selectedId: s.id });
    setStickerSheetOpen(false);
  };

  const change = (sticker: Sticker, committed: boolean) => {
    const next = { stickers: replaceSticker(state.stickers, sticker), selectedId: sticker.id };
    if (committed) commit(next);
    else setState(next);
  };

  const remove = () => {
    if (!state.selectedId) return;
    commit({ stickers: state.stickers.filter(s => s.id !== state.selectedId), selectedId: null });
  };

  const custom = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Sticker custom phải là ảnh.');
      return;
    }
    add('custom', URL.createObjectURL(file));
  };

  const save = async () => {
    if (!photo) return;
    setExporting(true);
    setMessage('Đang gói khoảnh khắc này để mày mang về…');
    try {
      const blob = await exportPng(photo, state.stickers, customImages.current);
      const file = new File([blob], 'tttt-photo-playground.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        void navigator.share({ files: [file], title: 'TTTT Photo Playground' }).catch(() => setMessage('Chia sẻ bị hủy. Bấm nút một lần nữa để thử lại nhé.'));
        setMessage('Ảnh đã nằm trong bảng Chia sẻ rồi.');
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        setMessage('Khoảnh khắc của mày đã được lưu rồi.');
      }
    } catch (error) {
      setMessage(`Chưa lưu được ảnh: ${(error as Error).message}`);
    } finally {
      setExporting(false);
    }
  };

  const allStickers = useMemo(() => packs.flatMap(pack => pack.stickers), []);

  return (
    <main className={`app-shell${photo ? ' story-editor' : ''}`}>
      <div className="ribbons" aria-hidden="true"><i /><i /><i /></div>
      {!photo ? (
        isQrFlow ? (
          <section className="loader-card-premium">
            <style>{`
              .loader-card-premium {
                background: rgba(255, 255, 255, 0.94);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 36px;
                border: 2px solid rgba(255, 255, 255, 0.85);
                box-shadow: 0 24px 48px -10px rgba(18, 2, 36, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.95);
                padding: 36px 22px 32px;
                margin: 15vh auto 0;
                max-width: 340px;
                text-align: center;
                animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              @keyframes popIn {
                from { opacity: 0; transform: scale(0.92) translateY(12px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
              .status-sticker-img {
                width: 64px;
                height: 64px;
                object-fit: contain;
                margin: 0 auto 12px;
                filter: drop-shadow(0 8px 14px rgba(235, 78, 142, 0.32));
                animation: floatSticker 2.4s ease-in-out infinite alternate;
              }
              @keyframes floatSticker {
                from { transform: translateY(0) rotate(-4deg); }
                to { transform: translateY(-7px) rotate(4deg); }
              }
              .loader-title {
                font-size: 26px !important;
                font-weight: 800 !important;
                letter-spacing: -0.02em;
                margin: 0 0 8px !important;
                background: linear-gradient(135deg, #5c1d68 0%, #ba2d6e 50%, #e04778 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: none !important;
              }
              .loader-desc {
                font-size: 14px !important;
                line-height: 1.5 !important;
                color: #6d4264 !important;
                margin: 0 0 20px !important;
                font-weight: 600;
              }
              .candy-spinner {
                width: 42px;
                height: 42px;
                margin: 4px auto 14px;
                border-radius: 50%;
                border: 3.5px solid rgba(224, 71, 120, 0.15);
                border-top-color: #e04778;
                border-right-color: #ff9a8b;
                animation: spinCandy 0.85s cubic-bezier(0.65, 0, 0.35, 1) infinite;
              }
              @keyframes spinCandy {
                to { transform: rotate(360deg); }
              }
              .btn-candy-retry {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                background: linear-gradient(135deg, #ff6584 0%, #f72585 100%);
                color: #fff !important;
                border: none;
                border-radius: 999px;
                padding: 13px 30px;
                font-size: 15px;
                font-weight: 700;
                letter-spacing: 0.01em;
                box-shadow: 0 10px 22px rgba(247, 37, 133, 0.38), inset 0 2px 2px rgba(255, 255, 255, 0.5);
                cursor: pointer;
                transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s;
              }
              .btn-candy-retry:active {
                transform: translateY(3px) scale(0.97);
                box-shadow: 0 4px 10px rgba(247, 37, 133, 0.3);
              }
              .retry-icon {
                font-size: 17px;
                line-height: 1;
                display: inline-block;
              }
            `}</style>
            {loadError ? (
              <>
                <img src="/stickers-clean/s01-07.png" alt="heart" className="status-sticker-img" />
                <h2 className="loader-title">Ting Ting...</h2>
                <p className="loader-desc">{loadError}</p>
                <button className="btn-candy-retry" onClick={() => void openUrl(url)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  <span>Thử lại ngay</span>
                </button>
              </>
            ) : (
              <>
                <img src="/stickers-clean/s01-01.png" alt="star" className="status-sticker-img" />
                <div className="candy-spinner" />
                <h2 className="loader-title">Ting Ting...</h2>
                <p className="loader-desc">Đợi một chút xíu, ảnh đang tới nè ✨</p>
              </>
            )}
          </section>
        ) : (
          <section className="loader card">
            <h2>Chọn ảnh</h2>
            <p>{message}</p>
            <button className="primary" onClick={() => fileRef.current?.click()}>Chọn ảnh</button>
            <label className="url-field">Dán link ảnh
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." inputMode="url" />
              <button onClick={() => void openUrl()}>Mở ảnh</button>
            </label>
            <input hidden ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePhoto} />
          </section>
        )
      ) : (
        <>
          <section className="editor">
            <PhotoStage photo={photo} stickers={state.stickers} selectedId={state.selectedId} onSelect={id => setState(s => ({ ...s, selectedId: id }))} onChange={change} customImages={customImages.current} imageVersion={imageVersion} onDelete={remove} />
          </section>
          <aside className="story-tools" aria-label="Công cụ ảnh">
            <button className="story-tool story-stickers" type="button" onClick={() => setStickerSheetOpen(true)} aria-label="Mở nhãn dán">
              <img src={stickerToolPreviews[stickerPreview]} alt="" />
            </button>
            <button className="story-tool story-export" type="button" onClick={() => void save()} disabled={exporting} aria-label="Lưu ảnh">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </aside>
          <div
            className={`story-sheet-backdrop${isStickerSheetOpen ? ' is-open' : ''}`}
            onClick={() => setStickerSheetOpen(false)}
            aria-hidden="true"
          />
          <section className={`tray story-sheet${isStickerSheetOpen ? ' is-open' : ''}`} aria-hidden={!isStickerSheetOpen}>
            <div className="sheet-handle" />
            <header className="sheet-heading">
              <button type="button" onClick={() => setStickerSheetOpen(false)} aria-label="Đóng nhãn dán">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h2>Nhãn dán</h2>
              <button type="button" onClick={() => stickerRef.current?.click()} aria-label="Thêm sticker ảnh của bạn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </header>
            <div className="sticker-grid">
              {allStickers.map((s, index) => (
                <button key={`${s.imageUrl}-${index}`} className="sprite-tile" onClick={() => add(s.kind, s.imageUrl, s.emoji, s.sourceRect)} aria-label={`Thêm ${s.label}`}>
                  <img className="sticker-icon sticker-preview" src={s.imageUrl} alt="" />
                </button>
              ))}
            </div>
            <input hidden ref={stickerRef} type="file" accept="image/png,image/webp,image/jpeg" onChange={custom} />
          </section>
        </>
      )}
    </main>
  );
}
