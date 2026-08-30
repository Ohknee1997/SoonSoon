import React, { useState, useRef, useEffect } from 'react';
import { CustomTextItem } from '../types';
import {
  updateCustomText,
  deleteCustomText,
  addCustomText,
} from '../utils/customTextStorage';
import {
  Type,
  Trash2,
  Move,
  Palette,
  Sliders,
  Check,
  Copy,
  RotateCw,
  Eye,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';

interface CustomTextLayerProps {
  items: CustomTextItem[];
  isEditing: boolean;
  activeTabId: string;
  onItemsChange: (items: CustomTextItem[]) => void;
}

const COLOR_PRESETS = [
  { name: 'Gold', hex: '#fbbf24' },
  { name: 'Bright Yellow', hex: '#fde047' },
  { name: 'Neon Red', hex: '#ff0033' },
  { name: 'Hot Red', hex: '#ef4444' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Neon Purple', hex: '#c084fc' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'Vibrant Orange', hex: '#f97316' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Deep Black', hex: '#000000' },
];

const BG_PRESETS = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'Dark Glass', value: 'rgba(15, 23, 42, 0.85)' },
  { label: 'Solid Black', value: '#000000' },
  { label: 'Red Glow Pill', value: 'rgba(239, 68, 68, 0.25)' },
  { label: 'Gold Pill', value: 'rgba(245, 158, 11, 0.25)' },
  { label: 'Cyan Pill', value: 'rgba(6, 182, 212, 0.25)' },
  { label: 'Solid White', value: '#ffffff' },
];

export const CustomTextLayer: React.FC<CustomTextLayerProps> = ({
  items,
  isEditing,
  activeTabId,
  onItemsChange,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; startXPercent: number; startYPx: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items matching active tab or all
  const visibleItems = items.filter(
    (item) => !item.targetTabId || item.targetTabId === 'all' || item.targetTabId === activeTabId
  );

  const selectedItem = items.find((i) => i.id === selectedId);

  // Handle Dragging
  useEffect(() => {
    if (!draggingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const deltaXPercent = (deltaX / containerRect.width) * 100;
      let newXPercent = Math.max(2, Math.min(98, dragStartRef.current.startXPercent + deltaXPercent));
      let newYPx = Math.max(0, dragStartRef.current.startYPx + deltaY);

      onItemsChange(updateCustomText(draggingId, { xPercent: Math.round(newXPercent * 10) / 10, yPx: Math.round(newYPx) }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current || !containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = touch.clientX - dragStartRef.current.startX;
      const deltaY = touch.clientY - dragStartRef.current.startY;

      const deltaXPercent = (deltaX / containerRect.width) * 100;
      let newXPercent = Math.max(2, Math.min(98, dragStartRef.current.startXPercent + deltaXPercent));
      let newYPx = Math.max(0, dragStartRef.current.startYPx + deltaY);

      onItemsChange(updateCustomText(draggingId, { xPercent: Math.round(newXPercent * 10) / 10, yPx: Math.round(newYPx) }));
    };

    const handleEnd = () => {
      setDraggingId(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [draggingId, onItemsChange]);

  const handleStartDrag = (
    e: React.MouseEvent | React.TouchEvent,
    item: CustomTextItem
  ) => {
    if (!isEditing) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setSelectedId(item.id);
    setDraggingId(item.id);
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      startXPercent: item.xPercent ?? 50,
      startYPx: item.yPx ?? 100,
    };
  };

  const handleDuplicate = (item: CustomTextItem) => {
    const duplicated = addCustomText({
      ...item,
      xPercent: Math.min(90, (item.xPercent || 50) + 4),
      yPx: (item.yPx || 100) + 30,
      text: item.text + ' (Copy)',
    });
    setSelectedId(duplicated.id);
  };

  const handleDelete = (id: string) => {
    const next = deleteCustomText(id);
    onItemsChange(next);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div
      ref={containerRef}
      className="custom-text-layer-root relative w-full pointer-events-none z-30 min-h-[1px]"
      style={{ overflow: 'visible' }}
    >
      {/* Render Text Items */}
      {visibleItems.map((item) => {
        const isSelected = isEditing && selectedId === item.id;
        const isDragging = draggingId === item.id;

        return (
          <div
            key={item.id}
            id={item.id}
            className={`custom-text-floating-item absolute select-none transition-shadow ${
              isEditing ? 'pointer-events-auto cursor-grab' : 'pointer-events-auto'
            } ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 rounded-xl shadow-2xl z-40' : 'z-20'} ${
              isDragging ? 'cursor-grabbing opacity-90 scale-105' : ''
            }`}
            style={{
              left: `${item.xPercent}%`,
              top: `${item.yPx}px`,
              transform: `translateX(-50%) rotate(${item.rotation || 0}deg)`,
              maxWidth: '90vw',
            }}
            onClick={(e) => {
              if (isEditing) {
                e.stopPropagation();
                setSelectedId(item.id);
              }
            }}
          >
            {/* The Text Box */}
            <div
              className="relative px-3.5 py-1.5 rounded-xl flex items-center justify-center text-center backdrop-blur-sm transition-all"
              style={{
                fontSize: `${item.fontSize}px`,
                color: item.color,
                backgroundColor: item.bgColor || 'transparent',
                fontWeight: item.fontWeight || '800',
                fontStyle: item.isItalic ? 'italic' : 'normal',
                textDecoration: item.isUnderline ? 'underline' : 'none',
                textShadow: item.hasShadow ? '0 2px 10px rgba(0,0,0,0.85), 0 0 15px currentColor' : 'none',
                border: item.hasBorder ? `1.5px solid ${item.borderColor || item.color}` : 'none',
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              {item.text}

              {/* Edit Mode Drag Handle & Quick Controls */}
              {isEditing && (
                <div
                  className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center cursor-grab shadow-lg border border-white hover:scale-110 active:cursor-grabbing"
                  onMouseDown={(e) => handleStartDrag(e, item)}
                  onTouchStart={(e) => handleStartDrag(e, item)}
                  title="Click & Drag to position anywhere"
                >
                  <Move size={12} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Rich Custom Text Editor Modal/Palette (Opens when a text item is selected in edit mode) */}
      {isEditing && selectedItem && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500/80 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-w-xl w-[94vw] space-y-3.5 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Type size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Custom Text Styling Studio</h4>
                <p className="text-[10px] text-slate-400">Drag text anywhere &middot; Customize color, size & glow</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDuplicate(selectedItem)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Duplicate Text"
              >
                <Copy size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedItem.id)}
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                title="Delete Text"
              >
                <Trash2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close Editor"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Text Input Content */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>Text Content</span>
            </label>
            <input
              type="text"
              value={selectedItem.text}
              onChange={(e) => {
                const next = updateCustomText(selectedItem.id, { text: e.target.value });
                onItemsChange(next);
              }}
              placeholder="Enter your custom message, banner, or note..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Size Slider & Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 uppercase">Font Size ({selectedItem.fontSize}px)</span>
              <div className="flex items-center gap-1">
                {[14, 18, 22, 28, 36, 48, 64].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      const next = updateCustomText(selectedItem.id, { fontSize: sz });
                      onItemsChange(next);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                      selectedItem.fontSize === sz
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min="12"
              max="80"
              value={selectedItem.fontSize}
              onChange={(e) => {
                const next = updateCustomText(selectedItem.id, { fontSize: Number(e.target.value) });
                onItemsChange(next);
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Color Presets & Custom Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 uppercase flex items-center gap-1">
                <Palette size={12} className="text-amber-400" />
                <span>Text Color</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">{selectedItem.color}</span>
                <input
                  type="color"
                  value={selectedItem.color.startsWith('#') ? selectedItem.color : '#fbbf24'}
                  onChange={(e) => {
                    const next = updateCustomText(selectedItem.id, { color: e.target.value });
                    onItemsChange(next);
                  }}
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title="Custom Color Picker"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => {
                    const next = updateCustomText(selectedItem.id, {
                      color: preset.hex,
                      borderColor: selectedItem.hasBorder ? preset.hex : selectedItem.borderColor,
                    });
                    onItemsChange(next);
                  }}
                  className="w-6 h-6 rounded-full border border-white/30 hover:scale-115 transition shadow cursor-pointer flex items-center justify-center relative"
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                >
                  {selectedItem.color.toLowerCase() === preset.hex.toLowerCase() && (
                    <Check size={12} className={preset.hex === '#ffffff' || preset.hex === '#fde047' || preset.hex === '#fbbf24' ? 'text-black font-black' : 'text-white font-black'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Background Pill & Styling Options */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Background Style */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Background Style</label>
              <select
                value={selectedItem.bgColor || 'transparent'}
                onChange={(e) => {
                  const next = updateCustomText(selectedItem.id, { bgColor: e.target.value });
                  onItemsChange(next);
                }}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 focus:outline-none"
              >
                {BG_PRESETS.map((bg) => (
                  <option key={bg.value} value={bg.value}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Tab Scope */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Visible On</label>
              <select
                value={selectedItem.targetTabId || 'all'}
                onChange={(e) => {
                  const next = updateCustomText(selectedItem.id, { targetTabId: e.target.value });
                  onItemsChange(next);
                }}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 focus:outline-none"
              >
                <option value="all">Everywhere (All Tabs)</option>
                <option value={activeTabId}>Current Tab Only</option>
              </select>
            </div>
          </div>

          {/* Quick Style Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = updateCustomText(selectedItem.id, {
                    fontWeight: selectedItem.fontWeight === '900' ? '600' : '900',
                  });
                  onItemsChange(next);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedItem.fontWeight === '900' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Bold
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = updateCustomText(selectedItem.id, {
                    isItalic: !selectedItem.isItalic,
                  });
                  onItemsChange(next);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs italic font-bold cursor-pointer ${
                  selectedItem.isItalic ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Italic
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = updateCustomText(selectedItem.id, {
                    hasShadow: !selectedItem.hasShadow,
                  });
                  onItemsChange(next);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  selectedItem.hasShadow ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Sparkles size={11} />
                <span>Glow</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = updateCustomText(selectedItem.id, {
                    hasBorder: !selectedItem.hasBorder,
                  });
                  onItemsChange(next);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedItem.hasBorder ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Border
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="px-3.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow flex items-center gap-1"
            >
              <Check size={13} />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
