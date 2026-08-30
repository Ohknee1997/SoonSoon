import React, { useState } from 'react';
import { X, Upload, Maximize2, Trash2 } from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';

interface SecretSauceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardName: string;
  isEditing: boolean;
}

export const SecretSauceModal: React.FC<SecretSauceModalProps> = ({
  isOpen,
  onClose,
  cardName,
  isEditing,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [...prev, String(event.target?.result)]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
        <div className="bg-[#1a2c38] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#2f4553]">
          <div className="p-4 border-b border-[#2f4553] flex justify-between items-center bg-[#13222d]">
            <div>
              <h2 className="text-white font-bold text-base">{cardName} &mdash; Secret Sauce</h2>
              <p className="text-[11px] text-[#b1bad3]">2x Enhanced proof images & strategy notes</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 text-[#b1bad3] hover:text-white flex items-center justify-center transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[#b1bad3] text-xs font-bold uppercase tracking-wider">
                  Proof Screenshots (2x Display Size)
                </label>
                {images.length > 0 && (
                  <span className="text-[10.5px] text-amber-400 font-bold flex items-center gap-1">
                    <Maximize2 size={11} /> Tap to expand interactive lightbox
                  </span>
                )}
              </div>

              {isEditing && (
                <div className="border-2 border-dashed border-[#2f4553] rounded-xl p-4 flex items-center justify-center cursor-pointer hover:border-amber-400/60 transition mb-3 bg-[#0f1922]">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="secret-sauce-upload"
                  />
                  <label
                    htmlFor="secret-sauce-upload"
                    className="flex flex-col items-center gap-1.5 text-[#b1bad3] cursor-pointer"
                  >
                    <Upload size={22} className="text-amber-400" />
                    <span className="text-xs font-bold text-white">Upload Secret Sauce Proofs</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG or screenshots</span>
                  </label>
                </div>
              )}

              {/* 2x Enhanced Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pb-2">
                {images.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenLightbox(idx)}
                    className="relative group aspect-square bg-[#0f1922] rounded-xl overflow-hidden flex items-center justify-center border border-[#2f4553] hover:border-amber-400/80 cursor-pointer shadow-lg transition"
                  >
                    <img
                      src={imgSrc}
                      alt={`Proof #${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-2 py-1 rounded-full bg-slate-900/90 text-white text-[10.5px] font-bold flex items-center gap-1 border border-white/20">
                        <Maximize2 size={11} className="text-amber-400" />
                        <span>2x Zoom</span>
                      </span>
                    </div>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-md bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center text-xs transition"
                        title="Delete photo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {images.length === 0 && !isEditing && (
                <div className="p-4 rounded-xl bg-[#0f1922] border border-[#2f4553] text-center text-slate-400 text-xs">
                  No proof screenshots uploaded yet.
                </div>
              )}
            </div>

            <div>
              <label className="block text-[#b1bad3] text-xs font-bold uppercase tracking-wider mb-2">
                Strategy & Execution Notes
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!isEditing}
                readOnly={!isEditing}
                className="w-full bg-[#0f1922] text-white rounded-xl p-3 min-h-[120px] border border-[#2f4553] focus:border-amber-400 outline-none text-sm disabled:opacity-75"
                placeholder="Enter secret sauce details, cashout requirements, wagering tips..."
              />
            </div>
          </div>

          <div className="p-4 border-t border-[#2f4553] bg-[#13222d] flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition text-xs cursor-pointer"
            >
              Close
            </button>
            {isEditing && (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black transition text-xs shadow-lg shadow-amber-950/40 cursor-pointer"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      <ImageLightboxModal
        isOpen={lightboxOpen}
        images={images}
        initialIndex={lightboxIndex}
        title={`${cardName} — Secret Sauce`}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};
