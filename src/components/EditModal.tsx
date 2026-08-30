import React, { useState, useEffect, useRef } from 'react';
import { CardData, TabConfig } from '../types';
import { tripletToHex, hexToRgbTriplet } from '../utils';

interface EditModalProps {
  card: CardData | null;
  tabs: TabConfig[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: CardData) => void;
  onDelete: (cardId: string) => void;
}

const COLOR_PRESETS = [
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Gold', hex: '#f59e0b' },
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Red', hex: '#ef4444' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Violet', hex: '#a855f7' },
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Lime', hex: '#84cc16' },
  { label: 'Dark', hex: '#1e293b' },
];

export const EditModal: React.FC<EditModalProps> = ({
  card,
  tabs,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [sub, setSub] = useState('');
  const [domain, setDomain] = useState('');
  const [payout, setPayout] = useState('');
  const [payoutTag, setPayoutTag] = useState('');
  const [code, setCode] = useState('');
  const [badge, setBadge] = useState('');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [size, setSize] = useState<'s' | 'm' | 'l' | 'xl'>('m');
  const [color, setColor] = useState('#34d399');
  const [rating, setRating] = useState<number>(0);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [showStarsTopper, setShowStarsTopper] = useState<boolean>(false);
  const [tabId, setTabId] = useState('');
  const [hidden, setHidden] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState('');
  const [pendingImg, setPendingImg] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card) {
      setName(card.name || '');
      setSub(card.sub || '');
      setDomain(card.domain || '');
      setPayout(card.payout || '');
      setPayoutTag(card.payoutTag || '');
      setCode(card.code || '');
      setBadge(card.badge || '');
      setLabel(card.signupLabel || 'SIGN UP');
      setUrl(card.signupUrl || '');
      setSize(card.customSize || 'm');
      setColor(card.customColor || tripletToHex(card.accentRgb || '59, 130, 246'));
      setRating(card.rating || 0);
      setOrderNumber(card.orderNumber !== undefined && card.orderNumber !== null ? String(card.orderNumber) : '');
      setShowStarsTopper(Boolean(card.showStarsTopper));
      setTabId(card.tabId || tabs[0]?.id || 'casino-codes');
      setHidden(Boolean(card.hidden));
      setImgUrl(card.customImg && !card.customImg.startsWith('data:') ? card.customImg : '');
      setPendingImg(card.customImg || undefined);
    }
  }, [card, tabs]);

  if (!isOpen || !card) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImg(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPendingImg('');
    setImgUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    const finalImg =
      pendingImg !== undefined
        ? pendingImg
        : imgUrl.trim()
        ? imgUrl.trim()
        : undefined;

    const triplet = hexToRgbTriplet(color) || card.accentRgb;
    const parsedOrder = orderNumber.trim() !== '' ? Number(orderNumber) : undefined;

    const updated: CardData = {
      ...card,
      name: name.trim() || card.name,
      sub: sub.trim() || undefined,
      domain: domain.trim() || undefined,
      payout: payout.trim() || undefined,
      payoutTag: payoutTag.trim() || undefined,
      code: code.trim() || undefined,
      badge: badge.trim() || undefined,
      signupLabel: label.trim() || 'SIGN UP',
      signupUrl: url.trim() || card.signupUrl,
      customSize: size,
      customColor: color,
      rating: rating,
      orderNumber: isNaN(Number(parsedOrder)) ? undefined : parsedOrder,
      showStarsTopper: showStarsTopper,
      accentRgb: triplet,
      tabId: tabId || card.tabId,
      hidden: hidden,
      customImg: finalImg || undefined,
    };

    onSave(updated);
  };

  return (
    <div id="ohk-modal">
      <div className="ohk-modal-backdrop" onClick={onClose} />
      <div className="ohk-modal-card" role="dialog" aria-modal="true" aria-label="Edit square">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p className="ohk-modal-title" style={{ margin: 0 }}>EDIT APP / SQUARE</p>
          <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            ID: {card.id}
          </span>
        </div>

        {/* Visibility Toggle Box */}
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 14px',
            background: hidden ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: hidden ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', display: 'block' }}>
              {hidden ? '🔒 Hidden Square (All Data Saved)' : '👁️ Visible on Screen'}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', display: 'block' }}>
              {hidden
                ? 'This app is kept in your repository but hidden from normal view. Toggle to unhide.'
                : 'This app is currently displayed on the dashboard.'}
            </span>
          </div>
          <button
            type="button"
            className="ohk-btn"
            style={{
              background: hidden ? '#eab308' : '#10b981',
              color: '#000000',
              fontWeight: 800,
              fontSize: '11px',
              padding: '6px 12px',
            }}
            onClick={() => setHidden(!hidden)}
          >
            {hidden ? 'UNHIDE APP' : 'HIDE APP'}
          </button>
        </div>

        {/* Section 1: Text & Content */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8', marginBottom: '6px' }}>
            📝 Text & Details
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <label className="ohk-field">
              <span>App Name</span>
              <input
                id="ohk-f-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stake.us"
              />
            </label>

            <label className="ohk-field">
              <span>Subtitle / Tagline</span>
              <input
                id="ohk-f-sub"
                type="text"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                placeholder="e.g. Instant Payouts"
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <label className="ohk-field">
              <span>Payout Amount</span>
              <input
                id="ohk-f-payout"
                type="text"
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
                placeholder="e.g. $100–$150 Fast"
              />
            </label>

            <label className="ohk-field">
              <span>Payout Tag</span>
              <input
                id="ohk-f-payout-tag"
                type="text"
                value={payoutTag}
                onChange={(e) => setPayoutTag(e.target.value)}
                placeholder="e.g. INSTANT, FREE START"
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <label className="ohk-field">
              <span>Promo Code (Optional)</span>
              <input
                id="ohk-f-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ohknee"
              />
            </label>

            <label className="ohk-field">
              <span>Button Text</span>
              <input
                id="ohk-f-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. SIGN UP"
              />
            </label>
          </div>

          <label className="ohk-field">
            <span>Referral / Website Link</span>
            <input
              id="ohk-f-url"
              type="url"
              spellCheck="false"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>

        {/* Section 2: Size & Colors */}
        <div style={{ marginBottom: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f59e0b', marginBottom: '6px' }}>
            🎨 Size & Color
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <label className="ohk-field">
              <span>Card Size</span>
              <select
                id="ohk-f-size"
                value={size}
                onChange={(e) => setSize(e.target.value as 's' | 'm' | 'l' | 'xl')}
              >
                <option value="s">Small (Compact)</option>
                <option value="m">Normal (Standard)</option>
                <option value="l">Large (Tall)</option>
                <option value="xl">Extra Large (Hero 2-Col)</option>
              </select>
            </label>

            <label className="ohk-field">
              <span>Accent Color</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  id="ohk-f-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: '38px', height: '38px', padding: '2px', cursor: 'pointer', borderRadius: '6px' }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
            </label>
          </div>

          {/* Quick Color Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => setColor(p.hex)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: color.toLowerCase() === p.hex.toLowerCase() ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
                  border: color.toLowerCase() === p.hex.toLowerCase() ? `2px solid ${p.hex}` : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '14px',
                  padding: '3px 8px',
                  fontSize: '10.5px',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.hex }} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Location, Tab & Ordering */}
        <div style={{ marginBottom: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', marginBottom: '6px' }}>
            📍 Location & Ranking
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
            <label className="ohk-field">
              <span>Category / Tab</span>
              <select
                id="ohk-f-tab"
                value={tabId}
                onChange={(e) => setTabId(e.target.value)}
              >
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="ohk-field">
              <span>Order Rank #</span>
              <input
                id="ohk-f-order-num"
                type="number"
                min="1"
                max="999"
                placeholder="e.g. 1, 2, 3"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </label>

            <label className="ohk-field">
              <span>Star Rating</span>
              <input
                id="ohk-f-rating"
                type="number"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
            </label>
          </div>

          <div style={{ marginTop: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: showStarsTopper ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                border: showStarsTopper ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setShowStarsTopper(!showStarsTopper)}
            >
              <input
                type="checkbox"
                id="ohk-f-stars-topper"
                checked={showStarsTopper}
                onChange={(e) => setShowStarsTopper(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: showStarsTopper ? '#fbbf24' : '#ffffff', display: 'block' }}>
                  {showStarsTopper ? '★★★★★ 5 Golden Stars Top Banner Active' : '☆ 5 Golden Stars Banner (Off)'}
                </span>
                <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)' }}>
                  Shows a luxury gold stars banner across the top of the logo icon.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Logo & Image */}
        <div style={{ marginBottom: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc', marginBottom: '6px' }}>
            🖼️ Logo & Favicon
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <label className="ohk-field">
              <span>Domain (Favicon source)</span>
              <input
                id="ohk-f-domain"
                type="text"
                placeholder="e.g. stake.us"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </label>

            <label className="ohk-field">
              <span>Custom Photo URL</span>
              <input
                id="ohk-f-img"
                type="text"
                spellCheck="false"
                placeholder="https://... or upload below"
                value={imgUrl}
                onChange={(e) => {
                  setImgUrl(e.target.value);
                  setPendingImg(e.target.value);
                }}
              />
            </label>
          </div>

          <div className="ohk-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <label className="ohk-field" style={{ flex: 1, margin: 0 }}>
              <span>Upload Custom Photo</span>
              <input
                ref={fileInputRef}
                id="ohk-f-file"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
            {(pendingImg || imgUrl) && (
              <button
                type="button"
                className="ohk-btn ohk-btn-ghost"
                id="ohk-clear-img"
                onClick={handleClearPhoto}
                style={{ height: '38px' }}
              >
                Clear Photo
              </button>
            )}
          </div>
        </div>

        <div className="ohk-modal-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="ohk-btn ohk-btn-ghost"
            id="ohk-delete"
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${card.name}"?`)) {
                onClose();
                onDelete(card.id);
              }
            }}
          >
            Delete Square
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="ohk-btn ohk-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="ohk-btn ohk-btn-primary"
              id="ohk-save"
              style={{ background: '#10b981', color: '#000000', fontWeight: 'bold' }}
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
