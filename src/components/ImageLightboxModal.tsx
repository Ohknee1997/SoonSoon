import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  title = 'Secret Sauce Gallery',
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update currentIndex when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
      resetTransform();
    }
  }, [isOpen, initialIndex, images.length]);

  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(s + 0.3, 4));
      } else if (e.key === '-' || e.key === '_') {
        setScale((s) => Math.max(s - 0.3, 0.5));
      } else if (e.key === '0') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, resetTransform]);

  // Desktop Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale((prev) => Math.min(Math.max(0.6, prev + delta), 5));
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Gestures: Swipe, Pinch-to-zoom, Double-tap
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      const timeDiff = now - lastTapTimeRef.current;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };

      // Double tap detected
      if (timeDiff < 300) {
        if (scale > 1) {
          resetTransform();
        } else {
          setScale(2.5);
        }
      }
      lastTapTimeRef.current = now;

      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        };
      }
    } else if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      // Pinch to Zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / lastTouchDistanceRef.current;
      setScale((s) => Math.min(Math.max(0.8, s * ratio), 5));
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;

    // Detect horizontal swipe if not zoomed
    if (scale <= 1 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      const diffY = touch.clientY - touchStartRef.current.y;

      if (Math.abs(diffX) > 50 && Math.abs(diffY) < 60) {
        if (diffX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const currentImg = images[currentIndex];
    if (!currentImg) return;
    const a = document.createElement('a');
    a.href = currentImg;
    a.download = `secret-sauce-image-${currentIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex];

  return (
    <div
      ref={containerRef}
      id="image-lightbox-modal"
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-in fade-in duration-200"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Controls Bar */}
      <div className="relative z-30 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
            {currentIndex + 1} / {images.length}
          </div>
          <div className="hidden sm:block">
            <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
              {title}
            </h3>
            <p className="text-[11px] text-slate-400">
              Scroll wheel or pinch to zoom &bull; Drag to pan
            </p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.3))}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 flex items-center justify-center transition cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut size={16} />
          </button>

          {/* Scale Display & Reset */}
          <button
            type="button"
            onClick={resetTransform}
            className="px-2.5 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-slate-700/60 flex items-center justify-center gap-1 text-xs font-mono font-bold transition cursor-pointer"
            title="Reset Zoom & Pan (0)"
          >
            <RefreshCw size={12} className={scale !== 1 ? 'animate-spin' : ''} />
            <span>{Math.round(scale * 100)}%</span>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(4, s + 0.3))}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 flex items-center justify-center transition cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn size={16} />
          </button>

          {/* Rotate */}
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 flex items-center justify-center transition cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw size={16} />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 items-center justify-center transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 flex items-center justify-center transition cursor-pointer"
            title="Download Image"
          >
            <Download size={16} />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white flex items-center justify-center transition cursor-pointer ml-1 shadow-lg shadow-rose-950/50"
            title="Close Lightbox (ESC)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {currentImg && (
          <img
            src={currentImg}
            alt={`${title} proof #${currentIndex + 1}`}
            draggable={false}
            className="max-h-[82vh] max-w-[92vw] object-contain transition-transform duration-75 select-none rounded-lg shadow-2xl"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-13 md:h-13 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 flex items-center justify-center shadow-2xl transition active:scale-95 cursor-pointer z-20"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-13 md:h-13 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 flex items-center justify-center shadow-2xl transition active:scale-95 cursor-pointer z-20"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="relative z-30 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  resetTransform();
                }}
                className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50'
                    : 'border-slate-700/80 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
