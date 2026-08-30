import React, { useState, useEffect, useRef } from 'react';
import { WiiAvatar, UserProfile } from '../types';
import { getWiiRegistry, claimWiiAvatar, createAccount, syncUserProfile } from '../data/wiiAvatars';
import { WiiFaceIcon } from './WiiFaceIcon';
import { playWiiTick, playWiiVictoryChime } from '../audioUtils';

interface WiiAvatarSpinnerModalProps {
  isOpen: boolean;
  username: string;
  email?: string;
  password?: string;
  onAvatarClaimed: (profile: UserProfile, avatar: WiiAvatar) => void;
}

export const WiiAvatarSpinnerModal: React.FC<WiiAvatarSpinnerModalProps> = ({
  isOpen,
  username,
  email,
  password,
  onAvatarClaimed,
}) => {
  const [allAvatars, setAllAvatars] = useState<WiiAvatar[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [winningAvatar, setWinningAvatar] = useState<WiiAvatar | null>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const spinIntervalRef = useRef<number | null>(null);
  const audioTickCounterRef = useRef<number>(0);

  // Load avatar registry
  useEffect(() => {
    if (isOpen) {
      const registry = getWiiRegistry();
      setAllAvatars(registry);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSpin = () => {
    if (isSpinning || hasSpun) return;

    // Filter available (unclaimed) avatars
    const available = allAvatars.filter((a) => !a.claimed);
    if (available.length === 0) {
      alert('All avatars have been claimed! Resetting demo registry pool.');
      return;
    }

    // Pick random winner from available
    const selectedWinner = available[Math.floor(Math.random() * available.length)];
    const winnerGlobalIndex = allAvatars.findIndex((a) => a.id === selectedWinner.id);

    setIsSpinning(true);

    const totalSlots = allAvatars.length; // 100
    const rotations = 6; // full spins
    const targetSlotOffset = (winnerGlobalIndex >= 0 ? winnerGlobalIndex : 0);
    const degreesPerSlot = 360 / totalSlots;
    const finalAngle = rotations * 360 + (360 - targetSlotOffset * degreesPerSlot);

    let currentAngle = 0;
    const duration = 4800; // 4.8 seconds
    const startTime = performance.now();

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth deceleration curve (cubic-ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const angle = finalAngle * easeOut;
      currentAngle = angle;
      setWheelAngle(angle);

      // Track active passing slot for ticker sound
      const currentSlot = Math.floor((angle % 360) / degreesPerSlot) % totalSlots;
      setHighlightedIndex(currentSlot);

      audioTickCounterRef.current += 1;
      if (audioTickCounterRef.current % 4 === 0 && progress < 0.95) {
        playWiiTick(1 + (1 - progress) * 0.5);
      }

      if (progress < 1) {
        spinIntervalRef.current = requestAnimationFrame(animateSpin);
      } else {
        // Spin finished!
        setIsSpinning(false);
        setHasSpun(true);
        setWinningAvatar(selectedWinner);

        // Claim in registry
        claimWiiAvatar(selectedWinner.id, username);
        playWiiVictoryChime();
      }
    };

    spinIntervalRef.current = requestAnimationFrame(animateSpin);
  };

  const handleFinishOnboarding = () => {
    if (!winningAvatar) return;

    const initialProfile: UserProfile = {
      username,
      email: email || '',
      avatarId: winningAvatar.id,
      cryptoBalance: 0.00, // No starter balance
      spinBoosters: 0, // No starter spin booster
      equippedBadge: undefined, // No starter badge
      unlockedItems: [],
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString().split('T')[0],
      streakDays: 1,
      dailyRewardClaimed: false,
      totalMessages: 0,
    };

    if (password) {
      createAccount(username, email || 'user@ohknee.app', password, initialProfile);
    } else {
      syncUserProfile(initialProfile);
    }

    onAvatarClaimed(initialProfile, winningAvatar);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-lg animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      id="avatar-wheel-modal"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 md:p-8 text-white shadow-2xl shadow-amber-500/20 text-center overflow-hidden">
        {/* Background glow discs */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Console theme header */}
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 mb-2 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mx-auto text-center">
          <span>🎡</span>
          <span>100-SLOT AVATAR ROULETTE</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight text-center">
          Looks just like you
        </h2>
        <p className="text-slate-300 text-xs md:text-sm mb-4 max-w-lg mx-auto text-center leading-relaxed">
          Welcome <strong className="text-cyan-300">@{username}</strong>! Spin the 100-slot wheel to claim your permanent 1-of-1 Avatar.
        </p>

        {/* THE 100 AVATAR SPINNING WHEEL / CAROUSEL STAGE */}
        <div className="relative w-full py-4 flex flex-col items-center justify-center text-center">
          {/* Wheel Pointer Needle */}
          <div className="z-20 -mb-3 flex flex-col items-center justify-center mx-auto">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(251,191,36,0.8)]" />
          </div>

          {/* Rotating Wheel Container */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full p-2 bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-900 border-4 border-amber-400/80 shadow-2xl shadow-amber-400/30 flex items-center justify-center overflow-hidden mx-auto">
            {/* Center Axis Hub - Perfectly Centered */}
            <div className="absolute z-10 w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-4 border-slate-900 flex flex-col items-center justify-center text-center shadow-lg pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="text-2xl block text-center leading-none mb-0.5">🎮</span>
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-tight text-center block leading-tight px-1">
                100 AVATARS
              </span>
            </div>

            {/* Rotating Disc with Mini Avatars */}
            <div
              className="w-full h-full rounded-full relative"
              style={{
                transform: `rotate(${wheelAngle}deg)`,
                transition: isSpinning ? 'none' : 'transform 0.1s ease',
              }}
            >
              {allAvatars.slice(0, 36).map((av, idx) => {
                const totalVisible = 36;
                const angle = (idx / totalVisible) * 360;
                const radius = 118; // px from center
                const x = radius * Math.cos((angle - 90) * (Math.PI / 180));
                const y = radius * Math.sin((angle - 90) * (Math.PI / 180));

                return (
                  <div
                    key={av.id}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform flex items-center justify-center"
                    style={{
                      transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                    }}
                  >
                    <WiiFaceIcon avatar={av} size={26} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Centered Preview Carousel Ticker */}
          <div className="mt-3 w-full max-w-xs md:max-w-sm bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center justify-center text-center gap-2 overflow-hidden mx-auto">
            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase text-center">
              #{String((highlightedIndex % 100) + 1).padStart(3, '0')} Identity:
            </span>
            <span className="text-xs text-slate-200 font-semibold truncate text-center">
              {allAvatars[highlightedIndex % allAvatars.length]?.name || 'Selecting Avatar...'}
            </span>
          </div>
        </div>

        {/* WINNER ANNOUNCEMENT CARD */}
        {hasSpun && winningAvatar && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-emerald-400 shadow-xl shadow-emerald-500/20 animate-scaleUp text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <div className="relative flex-shrink-0">
                <WiiFaceIcon avatar={winningAvatar} size={72} frame="frame-gold-wii" />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950">
                  #{String(winningAvatar.number).padStart(3, '0')}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CLAIMED & LOCKED
                  </span>
                  <span className="text-xs text-slate-400">Slot #{String(winningAvatar.number).padStart(3, '0')}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white text-center sm:text-left">#{String(winningAvatar.number).padStart(3, '0')} Identity</h3>
                <p className="text-xs text-slate-300 text-center sm:text-left">
                  Assigned exclusively to <strong className="text-cyan-300">@{username}</strong>. No other user can claim this identity!
                </p>
              </div>
            </div>

            {/* Avatar Face Claim Confirmation */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-center text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">Permanent Avatar Face Unlocked &bull; Ready to Enter</span>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-5">
          {!hasSpun ? (
            <button
              type="button"
              onClick={handleStartSpin}
              disabled={isSpinning}
              className="w-full py-4 px-8 rounded-2xl font-black text-slate-950 text-base md:text-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 active:scale-95 transition shadow-xl shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 animate-pulse"
            >
              <span>{isSpinning ? '🎡 SPINNING 100 AVATAR SLOTS...' : 'SPIN AVATAR WHEEL NOW!'}</span>
              <span>✨</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="w-full py-4 px-8 rounded-2xl font-black text-slate-950 text-base md:text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-95 transition shadow-xl shadow-emerald-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Enter</span>
              <span>🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
