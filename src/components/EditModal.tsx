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
  const [payout, setPayout] = useState('');
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
      setPayout(card.payout || '');
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
      payout: payout.trim() || undefined,
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
        <p className="ohk-modal-title">EDIT SQUARE</p>

        {/* Visibility Toggle Box */}
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 14px',
            background: hidden ? 'rgba(234, 179, 8, 0.15)' : 'rgba(0, 0, 0, 0.25)',
            border: hidden ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', display: 'block' }}>
              {hidden ? '🔒 Hidden Square (Data Saved)' : '👁️ Visible in Public Dashboard'}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
              {hidden
                ? 'All codes, payout, and links are kept intact but hidden from non-editors.'
                : 'Turn ON to hide this square without losing any data.'}
            </span>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px', flexShrink: 0 }}>
            <input
              type="checkbox"
              id="ohk-f-hidden"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#eab308' }}
            />
            <span style={{ fontSize: '12px', fontWeight: '800', color: hidden ? '#fde047' : '#94a3b8' }}>
              {hidden ? 'HIDDEN' : 'SHOW'}
            </span>
          </label>
        </div>

        <label className="ohk-field">
          <span>Name</span>
          <input
            id="ohk-f-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="ohk-field">
          <span>Subtitle</span>
          <input
            id="ohk-f-sub"
            type="text"
            value={sub}
            onChange={(e) => setSub(e.target.value)}
          />
        </label>

        <label className="ohk-field">
          <span>Payout (e.g. $10)</span>
          <input
            id="ohk-f-payout"
            type="text"
            value={payout}
            onChange={(e) => setPayout(e.target.value)}
          />
        </label>
        
        <label className="ohk-field">
          <span>Badge</span>
          <input
            id="ohk-f-badge"
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
          />
        </label>

        <label className="ohk-field">
          <span>Button text</span>
          <input
            id="ohk-f-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>

        <label className="ohk-field">
          <span>Referral link</span>
          <input
            id="ohk-f-url"
            type="url"
            spellCheck="false"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>

        <div className="ohk-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <label className="ohk-field">
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>Top-Left Order #</strong>
              <span style={{ fontSize: '10px', color: '#38bdf8' }}>e.g. 1, 2, 3</span>
            </span>
            <input
              id="ohk-f-order-num"
              type="number"
              min="1"
              max="999"
              placeholder="Leave blank for none"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              style={{ fontWeight: 'bold' }}
            />
          </label>

          <label className="ohk-field">
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>5 Golden Stars Banner</strong>
              <span style={{ fontSize: '10px', color: '#f59e0b' }}>Top of Logo</span>
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 10px',
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
              <span style={{ fontSize: '12px', fontWeight: '800', color: showStarsTopper ? '#fbbf24' : '#94a3b8' }}>
                {showStarsTopper ? '★★★★★ ON' : '☆ Off'}
              </span>
            </div>
          </label>
        </div>

        <div className="ohk-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '8px' }}>
          <label className="ohk-field">
            <span>Size</span>
            <select
              id="ohk-f-size"
              value={size}
              onChange={(e) => setSize(e.target.value as 's' | 'm' | 'l' | 'xl')}
            >
              <option value="s">Small</option>
              <option value="m">Normal</option>
              <option value="l">Large</option>
              <option value="xl">Extra large</option>
            </select>
          </label>

          <label className="ohk-field">
            <span>Colour</span>
            <input
              id="ohk-f-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>

          <label className="ohk-field">
            <span>Rating (1-5)</span>
            <input
              id="ohk-f-rating"
              type="number"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </label>

          <label className="ohk-field">
            <span>Tab</span>
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
        </div>

        <label className="ohk-field">
          <span>Photo URL</span>
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

        <div className="ohk-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <label className="ohk-field" style={{ flex: 1 }}>
            <span>Upload photo</span>
            <input
              ref={fileInputRef}
              id="ohk-f-file"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </label>
          <button
            type="button"
            className="ohk-btn ohk-btn-ghost"
            id="ohk-clear-img"
            onClick={handleClearPhoto}
          >
            Remove photo
          </button>
        </div>

        <div className="ohk-modal-actions">
          <button type="button" className="ohk-btn ohk-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ohk-btn ohk-btn-ghost"
            id="ohk-delete"
            onClick={() => {
              onClose();
              onDelete(card.id);
            }}
          >
            Delete
          </button>
          {url && (
            <button
              type="button"
              className="ohk-btn ohk-btn-ghost"
              id="ohk-open"
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            >
              Open link
            </button>
          )}
          <button
            type="button"
            className="ohk-btn ohk-btn-primary"
            id="ohk-save"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
