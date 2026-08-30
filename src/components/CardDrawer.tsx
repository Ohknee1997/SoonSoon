import React, { useState, useRef } from 'react';
import { CardData, CardDetail } from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';
import { Maximize2, Upload, Trash2, ExternalLink } from 'lucide-react';

interface CardDrawerProps {
  card: CardData;
  detail: CardDetail;
  onUpdateDetail: (detail: CardDetail) => void;
  onClose: () => void;
}

export const CardDrawer: React.FC<CardDrawerProps> = ({
  card,
  detail,
  onUpdateDetail,
  onClose,
}) => {
  const [note, setNote] = useState(detail.note || '');
  const [link2, setLink2] = useState(detail.link2 || '');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    onUpdateDetail({ ...detail, note: val });
  };

  const handleLink2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setLink2(val);
    onUpdateDetail({ ...detail, link2: val });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newImg = String(reader.result);
      const updatedImages = [...(detail.images || []), newImg];
      onUpdateDetail({ ...detail, images: updatedImages });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updatedImages = (detail.images || []).filter((_, i) => i !== index);
    onUpdateDetail({ ...detail, images: updatedImages });
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const images = detail.images || [];

  return (
    <>
      <div className="ohk-drawer is-open" id={`drawer-${card.id}`}>
        <div className="ohk-drawer-inner">
          <button
            type="button"
            id={`drawer-close-btn-${card.id}`}
            className="ohk-drawer-close"
            data-drawer-close
            title="Exit and return to position"
            aria-label="Exit and return to position"
            onClick={onClose}
          >
            ✕
          </button>

          <p className="ohk-drawer-title" id={`drawer-title-${card.id}`}>
            {card.name} &mdash; Secret Sauce
          </p>
          <p className="ohk-drawer-sub" id={`drawer-sub-${card.id}`}>
            Private strategy notes & 2x proof image archive &mdash; saved on this device
          </p>

          <div className="ohk-drawer-note-section">
            <label
              className="ohk-drawer-link-label ohk-drawer-note-label"
              htmlFor={`drawer-note-input-${card.id}`}
            >
              How to complete this offer (Secret Strategy)
            </label>
            <textarea
              id={`drawer-note-input-${card.id}`}
              className="ohk-drawer-note"
              placeholder="Steps to complete the offer exactly — login used, deposit amount, promo code, wagering terms, quick cashout guide…"
              value={note}
              onChange={handleNoteChange}
            />
          </div>

          <div className="ohk-drawer-gallery-section">
            <div className="flex items-center justify-between mb-1.5">
              <label className="ohk-drawer-link-label mb-0">
                Secret Sauce Screenshots (2x Enhanced View)
              </label>
              {images.length > 0 && (
                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <Maximize2 size={11} /> Tap image for interactive lightbox
                </span>
              )}
            </div>

            {/* 2x Enriched Image Gallery Grid */}
            <div className="ohk-drawer-gallery" id={`drawer-gallery-${card.id}`}>
              {images.map((imgSrc, i) => (
                <div
                  className="ohk-drawer-img group cursor-pointer"
                  key={i}
                  id={`drawer-img-${card.id}-${i}`}
                  onClick={() => handleImageClick(i)}
                  title="Click to open interactive full-screen image lightbox"
                >
                  <img src={imgSrc} alt={`${card.name} proof #${i + 1}`} loading="lazy" />
                  
                  {/* Hover Overlay with Lightbox Indicator */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-bold flex items-center gap-1 border border-white/30 shadow-lg">
                      <Maximize2 size={12} className="text-amber-400" />
                      <span>Zoom 2x</span>
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    id={`drawer-img-remove-${card.id}-${i}`}
                    className="ohk-drawer-img-remove z-20"
                    title="Remove photo"
                    aria-label="Remove photo"
                    onClick={(e) => handleRemoveImage(e, i)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <label className="ohk-drawer-add" id={`drawer-add-photo-label-${card.id}`}>
                <div className="flex flex-col items-center gap-1">
                  <Upload size={18} className="text-amber-400" />
                  <span>+ Photo</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG / JPG</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  id={`drawer-file-input-${card.id}`}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          <div className="ohk-drawer-link-section">
            <label
              className="ohk-drawer-link-label"
              htmlFor={`drawer-link2-input-${card.id}`}
            >
              Second backup referral / strategy link
            </label>
            <input
              type="url"
              id={`drawer-link2-input-${card.id}`}
              className="ohk-drawer-link"
              placeholder="https://…"
              value={link2}
              onChange={handleLink2Change}
            />
          </div>

          <div className="ohk-drawer-actions" id={`drawer-actions-${card.id}`}>
            {card.signupUrl && (
              <button
                type="button"
                id={`drawer-visit-site-btn-${card.id}`}
                className="ohk-btn ohk-btn-ghost flex items-center gap-1.5"
                onClick={() => window.open(card.signupUrl, '_blank', 'noopener,noreferrer')}
              >
                <span>Visit Primary Site</span>
                <ExternalLink size={13} />
              </button>
            )}

            {link2 && (
              <button
                type="button"
                id={`drawer-visit-link2-btn-${card.id}`}
                className="ohk-btn ohk-btn-ghost flex items-center gap-1.5"
                onClick={() => window.open(link2, '_blank', 'noopener,noreferrer')}
              >
                <span>Visit Link 2</span>
                <ExternalLink size={13} />
              </button>
            )}

            <button
              type="button"
              id={`drawer-done-btn-${card.id}`}
              className="ohk-btn ohk-btn-primary px-5 font-black"
              onClick={onClose}
            >
              Done & Save
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        images={images}
        initialIndex={lightboxIndex}
        title={`${card.name} — Secret Sauce Proofs`}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};
