import React from 'react';
import { EngineData } from '../types';

interface EngineCardProps {
  engine: EngineData;
  isEditing: boolean;
  onEditEngine: (engine: EngineData) => void;
  onDeleteEngine: (engine: EngineData) => void;
}

export const EngineCard: React.FC<EngineCardProps> = ({
  engine,
  isEditing,
  onEditEngine,
  onDeleteEngine,
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete the engine "${engine.name}"?`)) {
      onDeleteEngine(engine);
    }
  };

  const handleLaunch = () => {
    window.open(engine.signupUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      id={`engine-${engine.id}`}
      className="engine"
      data-name={engine.name.toLowerCase()}
      style={
        {
          '--grad-a': engine.gradA,
          '--grad-b': engine.gradB,
          '--glow': engine.glow,
        } as React.CSSProperties
      }
      onClick={() => isEditing && onEditEngine(engine)}
    >
      <span className="engine-veil" aria-hidden="true" />

      {/* Trash button (Edit mode only) */}
      <button
        type="button"
        id={`engine-trash-${engine.id}`}
        className="ohk-trash"
        title="Delete this engine"
        aria-label="Delete this engine"
        onClick={handleDeleteClick}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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

      <div className="engine-body">
        <div className="engine-head">
          <span className="engine-loop">{engine.loopText}</span>
          <span className="engine-title" id={`engine-title-${engine.id}`}>
            {engine.name}
          </span>
        </div>

        <div className="badges">
          {engine.badges.map((b, i) => (
            <span key={i} className="badge" title={b.title}>
              {b.text}
            </span>
          ))}
        </div>

        <div className="pillars">
          {engine.pillars.map((p, i) => (
            <div key={i} className="pillar">
              <div
                className="pillar-frame"
                role="link"
                tabIndex={0}
                onClick={handleLaunch}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLaunch();
                  }
                }}
              >
                <img src={p.imgSrc} loading="lazy" alt={p.label} />
                <span className="pillar-veil" aria-hidden="true" />
              </div>
              <span className="pillar-label">{p.label}</span>
            </div>
          ))}
        </div>

        <a
          className="engine-btn"
          id={`engine-btn-${engine.id}`}
          href={engine.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="signup-label">{engine.signupLabel || 'SIGN UP'}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </a>
      </div>
    </article>
  );
};
