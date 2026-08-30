import React from 'react';
import { WiiAvatar } from '../types';

interface WiiFaceIconProps {
  avatar?: WiiAvatar | null;
  customUrl?: string;
  size?: number;
  frame?: string;
  className?: string;
  showBadge?: boolean;
}

export const WiiFaceIcon: React.FC<WiiFaceIconProps> = ({
  avatar,
  customUrl,
  size = 48,
  frame,
  className = '',
}) => {
  if (customUrl) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={customUrl}
          alt="Custom Avatar"
          className="w-full h-full object-cover rounded-full"
        />
        {frame && renderFrameOverlay(frame, size)}
      </div>
    );
  }

  // Fallback default avatar if none provided
  const av: WiiAvatar = avatar || {
    id: 'avatar-001',
    number: 1,
    name: 'Slot #001',
    gender: 'm',
    hairStyle: 'spiky',
    hairColor: '#212121',
    skinTone: '#ffd1b3',
    eyeType: 'classic-dots',
    eyebrows: 'straight',
    mouth: 'small-smile',
    accessory: 'none',
    shirtColor: '#3b82f6',
    vibe: 'Retro',
    claimed: false,
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: frame ? undefined : '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
      title={`Slot #${String(av.number).padStart(3, '0')} (${av.vibe || 'Console'} Avatar)`}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full rounded-full overflow-hidden"
      >
        <defs>
          {/* 2000s console matte background */}
          <radialGradient id={`bg-${av.id}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>

          {/* Skin gradient */}
          <linearGradient id={`skin-${av.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={av.skinTone} />
            <stop offset="100%" stopColor={darkenColor(av.skinTone, 15)} />
          </linearGradient>

          {/* Hair gradient */}
          <linearGradient id={`hair-${av.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lightenColor(av.hairColor, 20)} />
            <stop offset="100%" stopColor={av.hairColor} />
          </linearGradient>

          {/* Shirt gradient */}
          <linearGradient id={`shirt-${av.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={av.shirtColor} />
            <stop offset="100%" stopColor={darkenColor(av.shirtColor, 25)} />
          </linearGradient>
        </defs>

        {/* Background Disc */}
        <circle cx="50" cy="50" r="48" fill={`url(#bg-${av.id})`} stroke="#94a3b8" strokeWidth="2" />

        {/* Shirt Collar / Body Base */}
        <path
          d="M 20 100 C 20 78 80 78 80 100 Z"
          fill={`url(#shirt-${av.id})`}
        />
        <path
          d="M 44 80 L 50 88 L 56 80 Z"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Head Base */}
        <ellipse
          cx="50"
          cy="48"
          rx="26"
          ry="28"
          fill={`url(#skin-${av.id})`}
          stroke={darkenColor(av.skinTone, 30)}
          strokeWidth="1.2"
        />

        {/* Hair Styles */}
        {renderHair(av)}

        {/* Eyebrows */}
        {renderEyebrows(av)}

        {/* Eyes */}
        {renderEyes(av)}

        {/* Nose */}
        <path
          d="M 50 48 L 47 54 L 50 54"
          fill="none"
          stroke={darkenColor(av.skinTone, 35)}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mouth & Facial Hair */}
        {renderMouth(av)}

        {/* Cheeks blush */}
        {(av.gender === 'f' || av.accessory === 'blush') && (
          <>
            <circle cx="32" cy="54" r="4.5" fill="#f43f5e" opacity="0.35" />
            <circle cx="68" cy="54" r="4.5" fill="#f43f5e" opacity="0.35" />
          </>
        )}

        {/* Accessories */}
        {renderAccessory(av)}
      </svg>

      {/* Frame Ring Overlay */}
      {frame && renderFrameOverlay(frame, size)}
    </div>
  );
};

// Hair renderer
function renderHair(av: WiiAvatar) {
  const hairGrad = `url(#hair-${av.id})`;

  switch (av.hairStyle) {
    case 'spiky':
      return (
        <path
          d="M 22 42 C 22 20 30 16 38 18 C 42 12 52 10 58 14 C 66 12 76 18 78 40 C 76 34 68 30 50 30 C 32 30 24 34 22 42 Z"
          fill={hairGrad}
        />
      );
    case 'bowl':
      return (
        <path
          d="M 22 46 C 20 22 80 22 78 46 C 74 36 62 32 50 32 C 38 32 26 36 22 46 Z"
          fill={hairGrad}
        />
      );
    case 'afro':
      return (
        <circle cx="50" cy="38" r="34" fill={hairGrad} opacity="0.95" />
      );
    case 'twin-tails':
      return (
        <>
          <path
            d="M 24 45 C 24 24 76 24 76 45 C 68 34 50 32 50 32 C 50 32 32 34 24 45 Z"
            fill={hairGrad}
          />
          <ellipse cx="18" cy="54" rx="7" ry="14" fill={hairGrad} />
          <ellipse cx="82" cy="54" rx="7" ry="14" fill={hairGrad} />
        </>
      );
    case 'curly':
      return (
        <path
          d="M 20 48 C 16 36 20 20 34 16 C 42 14 58 14 66 16 C 80 20 84 36 80 48 C 74 38 60 32 50 32 C 40 32 26 38 20 48 Z"
          fill={hairGrad}
        />
      );
    case 'ponytail':
      return (
        <>
          <ellipse cx="50" cy="18" rx="10" ry="8" fill={hairGrad} />
          <path
            d="M 24 44 C 24 24 76 24 76 44 C 68 34 50 30 50 30 C 50 30 32 34 24 44 Z"
            fill={hairGrad}
          />
        </>
      );
    case 'mohawk':
      return (
        <path
          d="M 44 32 L 47 12 L 53 12 L 56 32 Z"
          fill={hairGrad}
        />
      );
    case 'cap':
      return (
        <>
          <path d="M 20 40 C 20 20 80 20 80 40 Z" fill={av.shirtColor} />
          <path d="M 16 38 Q 50 30 84 38 Q 50 44 16 38 Z" fill={darkenColor(av.shirtColor, 20)} />
        </>
      );
    case 'bald':
      return null;
    default:
      // side-part default
      return (
        <path
          d="M 22 44 C 22 22 78 20 78 44 C 70 34 54 30 46 32 C 34 34 26 38 22 44 Z"
          fill={hairGrad}
        />
      );
  }
}

// Eyebrows
function renderEyebrows(av: WiiAvatar) {
  const color = darkenColor(av.hairColor, 10);
  switch (av.eyebrows) {
    case 'arched':
      return (
        <>
          <path d="M 33 37 Q 38 33 43 37" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M 57 37 Q 62 33 67 37" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      );
    case 'bushy':
      return (
        <>
          <rect x="32" y="35" width="12" height="3.5" rx="1.5" fill={color} />
          <rect x="56" y="35" width="12" height="3.5" rx="1.5" fill={color} />
        </>
      );
    case 'surprised':
      return (
        <>
          <path d="M 33 34 Q 38 30 43 34" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 57 34 Q 62 30 67 34" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          <line x1="33" y1="36" x2="43" y2="36" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="57" y1="36" x2="67" y2="36" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
  }
}

// Eyes
function renderEyes(av: WiiAvatar) {
  switch (av.eyeType) {
    case 'anime-sparkle':
      return (
        <>
          <ellipse cx="38" cy="45" rx="4.5" ry="5.5" fill="#1e293b" />
          <circle cx="36.5" cy="43" r="1.8" fill="#ffffff" />
          <ellipse cx="62" cy="45" rx="4.5" ry="5.5" fill="#1e293b" />
          <circle cx="60.5" cy="43" r="1.8" fill="#ffffff" />
        </>
      );
    case 'curved-happy':
      return (
        <>
          <path d="M 34 46 Q 38 41 42 46" stroke="#1e293b" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 58 46 Q 62 41 66 46" stroke="#1e293b" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </>
      );
    case 'wink':
      return (
        <>
          <circle cx="38" cy="45" r="3.5" fill="#1e293b" />
          <circle cx="37" cy="44" r="1.2" fill="#ffffff" />
          <path d="M 58 46 Q 62 41 66 46" stroke="#1e293b" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </>
      );
    default:
      // classic-dots
      return (
        <>
          <circle cx="38" cy="45" r="3.5" fill="#0f172a" />
          <circle cx="37" cy="43.5" r="1.2" fill="#ffffff" />
          <circle cx="62" cy="45" r="3.5" fill="#0f172a" />
          <circle cx="61" cy="43.5" r="1.2" fill="#ffffff" />
        </>
      );
  }
}

// Mouth
function renderMouth(av: WiiAvatar) {
  switch (av.mouth) {
    case 'wide-grin':
      return (
        <path
          d="M 40 60 Q 50 70 60 60 Z"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="1.8"
        />
      );
    case 'open-laugh':
      return (
        <path
          d="M 42 59 Q 50 72 58 59 Z"
          fill="#e11d48"
          stroke="#0f172a"
          strokeWidth="1.6"
        />
      );
    case 'mustache-smile':
      return (
        <>
          <path
            d="M 40 56 Q 45 52 50 56 Q 55 52 60 56 Q 50 62 40 56 Z"
            fill={av.hairColor}
          />
          <path d="M 43 62 Q 50 66 57 62" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      );
    case 'goatee':
      return (
        <>
          <path d="M 43 59 Q 50 65 57 59" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="67" rx="3.5" ry="2.5" fill={av.hairColor} />
        </>
      );
    default:
      // small-smile
      return (
        <path
          d="M 42 59 Q 50 65 58 59"
          stroke="#0f172a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
}

// Accessories
function renderAccessory(av: WiiAvatar) {
  switch (av.accessory) {
    case 'glasses':
    case 'nerd-square':
      return (
        <>
          <rect x="30" y="39" width="16" height="12" rx="3" fill="none" stroke="#0f172a" strokeWidth="2" />
          <rect x="54" y="39" width="16" height="12" rx="3" fill="none" stroke="#0f172a" strokeWidth="2" />
          <line x1="46" y1="45" x2="54" y2="45" stroke="#0f172a" strokeWidth="2" />
        </>
      );
    case 'shades':
    case 'sunglasses-cool':
      return (
        <>
          <rect x="28" y="38" width="19" height="14" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          <rect x="53" y="38" width="19" height="14" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          <line x1="47" y1="43" x2="53" y2="43" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="31" y1="41" x2="43" y2="47" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
          <line x1="56" y1="41" x2="68" y2="47" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
        </>
      );
    case 'headband':
      return (
        <path d="M 22 36 Q 50 30 78 36" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
      );
    case 'mole':
      return <circle cx="36" cy="56" r="1.2" fill="#3e2723" />;
    default:
      return null;
  }
}

// Frame overlay renderer
function renderFrameOverlay(frameId: string, size: number) {
  if (frameId.includes('gold') || frameId === 'frame-gold-wii') {
    return (
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `${Math.max(2, size * 0.07)}px solid #fbbf24`,
          boxShadow: '0 0 10px rgba(251, 191, 36, 0.7)',
        }}
      />
    );
  }
  if (frameId.includes('rainbow') || frameId === 'frame-rainbow') {
    return (
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `${Math.max(2, size * 0.07)}px solid transparent`,
          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)',
        }}
      />
    );
  }
  if (frameId.includes('neon') || frameId === 'frame-neon-pulse') {
    return (
      <div
        className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
        style={{
          border: `${Math.max(2, size * 0.07)}px solid #06b6d4`,
          boxShadow: '0 0 12px #06b6d4',
        }}
      />
    );
  }
  if (frameId.includes('flame') || frameId === 'frame-flame') {
    return (
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `${Math.max(2, size * 0.07)}px solid #f97316`,
          boxShadow: '0 0 10px rgba(249, 115, 22, 0.8)',
        }}
      />
    );
  }
  return null;
}

// Color helper utils
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const B = ((num >> 8) & 0x00ff) + amt;
  const G = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
    (G < 255 ? (G < 1 ? 0 : G) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const B = ((num >> 8) & 0x00ff) - amt;
  const G = (num & 0x0000ff) - amt;
  return `#${(
    0x1000000 +
    (R > 0 ? R : 0) * 0x10000 +
    (B > 0 ? B : 0) * 0x100 +
    (G > 0 ? G : 0)
  )
    .toString(16)
    .slice(1)}`;
}
