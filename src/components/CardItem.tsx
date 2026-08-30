import React, { useState } from 'react';
import { CardData } from '../types';
import { initialsOf, copyTextToClipboard } from '../utils';
import { trackOfferClick } from '../utils/userAnalytics';

interface CardItemProps {
  card: CardData;
  isExpanded: boolean;
  isEditing: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onToggleDrawer: (card: CardData) => void;
  onEditCard: (card: CardData) => void;
  onDeleteCard: (card: CardData) => void;
  onToggleHide?: (cardId: string) => void;
  onMoveLeft?: (cardId: string) => void;
  onMoveRight?: (cardId: string) => void;
  onDragStart?: (cardId: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLElement>, cardId: string) => void;
  onDrop?: (cardId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  isExpanded,
  isEditing,
  canMoveLeft,
  canMoveRight,
  onToggleDrawer,
  onEditCard,
  onDeleteCard,
  onToggleHide,
  onMoveLeft,
  onMoveRight,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!card.code) return;
    copyTextToClipboard(card.code).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing) {
      onEditCard(card);
      return;
    }
    try {
      const active = localStorage.getItem('ohknee.active.account.user.v2');
      const username = active ? JSON.parse(active) : 'guest';
      trackOfferClick(username, card.name, 'drawer');
    } catch {}
    // Outside edit mode, click opens the drawer
    onToggleDrawer(card);
  };

  const handleSecretClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) {
      onEditCard(card);
      return;
    }
    try {
      const active = localStorage.getItem('ohknee.active.account.user.v2');
      const username = active ? JSON.parse(active) : 'guest';
      trackOfferClick(username, card.name, 'secret_sauce');
    } catch {}
    onToggleDrawer(card);
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    try {
      const active = localStorage.getItem('ohknee.active.account.user.v2');
      const username = active ? JSON.parse(active) : 'guest';
      trackOfferClick(username, card.name, 'signup');
    } catch {}
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEditCard(card);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete the square for "${card.name}"?`)) {
      onDeleteCard(card);
    }
  };

  const logoSrc =
    card.logoUrl ||
    (card.domain
      ? `https://www.google.com/s2/favicons?domain=${card.domain}&sz=128`
      : undefined);

  return (
    <article
      id={`card-${card.id}`}
      className={`card app-card ${isExpanded ? 'is-expanded' : ''} ${
        card.hidden ? 'is-card-hidden' : ''
      } ${
        card.customSize && card.customSize !== 'm' ? `ohk-size-${card.customSize}` : ''
      } ${card.customImg ? 'ohk-has-photo' : ''} ${isDragging ? 'is-card-dragging' : ''} ${
        isDragOver ? 'is-card-drag-over' : ''
      }`}
      data-name={card.name.toLowerCase()}
      data-key={card.id}
      style={
        {
          '--accent': card.customColor
            ? card.accentRgb
            : card.accentRgb || '59, 130, 246',
        } as React.CSSProperties
      }
      draggable={isEditing}
      onDragStart={(e) => {
        if (!isEditing) return;
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(card.id);
      }}
      onDragOver={(e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver?.(e, card.id);
      }}
      onDrop={(e) => {
        if (!isEditing) return;
        e.preventDefault();
        onDrop?.(card.id);
      }}
      onDragEnd={() => {
        if (!isEditing) return;
        onDragEnd?.();
      }}
      onClick={handleCardClick}
    >
      {/* Edit Mode Controls: Move Left/Right, Drag Grip, Hide/Unhide, Trash */}
      {isEditing && (
        <div className="ohk-card-edit-bar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="ohk-edit-move-btn"
            title="Move square left"
            aria-label="Move square left"
            disabled={!canMoveLeft}
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft?.(card.id);
            }}
          >
            ◀
          </button>

          <span className="ohk-drag-grip" title="Drag to rearrange">
            ⠿ MOVE
          </span>

          <button
            type="button"
            className="ohk-edit-move-btn"
            title="Move square right"
            aria-label="Move square right"
            disabled={!canMoveRight}
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight?.(card.id);
            }}
          >
            ▶
          </button>

          <button
            type="button"
            id={`card-hide-btn-${card.id}`}
            className={`ohk-edit-hide-btn ${card.hidden ? 'is-hidden-active' : ''}`}
            title={card.hidden ? "Unhide this square (currently hidden from public)" : "Hide this square from public view (saves all data)"}
            aria-label={card.hidden ? "Unhide square" : "Hide square"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleHide?.(card.id);
            }}
          >
            {card.hidden ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
            <span>{card.hidden ? 'UNHIDE' : 'HIDE'}</span>
          </button>

          <button
            type="button"
            id={`card-trash-${card.id}`}
            className="ohk-trash"
            title="Delete this square"
            aria-label="Delete this square"
            onClick={handleDeleteClick}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      )}

      {/* Hidden banner overlay indicator in edit mode */}
      {isEditing && card.hidden && (
        <div className="ohk-card-hidden-indicator" title="This square is hidden from regular users but saved with all its data">
          <span className="hidden-pill">🔒 HIDDEN (DATA SAVED)</span>
        </div>
      )}

      {/* Custom photo top if uploaded */}
      {card.customImg && (
        <div
          className="ohk-photo"
          id={`card-photo-${card.id}`}
          style={{ backgroundImage: `url("${card.customImg}")` }}
        />
      )}

      <div className="card-top">
        {card.rating && (
          <div className="ohk-rating" style={{ position: 'absolute', top: '8px', right: '40px' }}>
            {Array.from({ length: card.rating }).map((_, i) => (
              <span key={i} style={{ color: '#FCD34D' }}>★</span>
            ))}
          </div>
        )}
        {logoSrc ? (
          <div className="logo-tile" id={`card-logo-tile-${card.id}`}>
            <img src={logoSrc} alt={`${card.name} logo`} loading="lazy" decoding="async" />
            <span className="avatar-glow" aria-hidden="true" />
          </div>
        ) : (
          <div className="avatar" id={`card-avatar-${card.id}`}>
            <span className="avatar-initials">{initialsOf(card.name)}</span>
            <span className="avatar-glow" aria-hidden="true" />
          </div>
        )}

        <div className="card-titles">
          <p className="card-name" id={`card-name-${card.id}`}>
            {card.name}
          </p>
          {card.sub && <p className="card-sub">{card.sub}</p>}
        </div>

        <button
          className="edit-btn"
          id={`card-edit-btn-${card.id}`}
          type="button"
          title="Edit button text"
          aria-label={`Edit button text for ${card.name}`}
          onClick={handleEditClick}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>

      {card.payout && (
        <p className="payout" id={`card-payout-${card.id}`}>
          <span className="payout-amt">{card.payout}</span>
          {card.payoutTag && (
            <span className={`payout-tag ${card.tierClass || 'tier-free'}`}>
              {card.payoutTag}
            </span>
          )}
        </p>
      )}

      {card.code ? (
        <div className="code-row" id={`card-code-row-${card.id}`}>
          <span className="code-key">CODE</span>
          <code className="code-value">{card.code}</code>
          <button
            className={`code-copy ${copied ? 'is-copied' : ''}`}
            type="button"
            data-copy={card.code}
            id={`card-code-copy-${card.id}`}
            aria-label={`Copy promo code ${card.code}`}
            onClick={handleCopy}
          >
            <span className="code-copy-text">{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      ) : card.payout ? (
        <div className="code-row is-empty" id={`card-code-empty-${card.id}`}>
          <span className="code-none">No code needed</span>
        </div>
      ) : null}

      {/* Button row with solid Sign Up and solid Secret Sauce buttons */}
      <div className="card-cta" id={`card-cta-${card.id}`}>
        <div className="card-cta-row">
          <a
            className="signup-btn"
            id={`signup-btn-${card.id}`}
            href={card.signupUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSignUpClick}
          >
            <span className="signup-label">{card.signupLabel || 'SIGN UP'}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ext-ico"
              aria-hidden="true"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
          <button
            className="secret-btn"
            id={`secret-btn-${card.id}`}
            type="button"
            onClick={handleSecretClick}
          >
            Secret
            <br />
            Sauce
          </button>
        </div>
      </div>
    </article>
  );
};
