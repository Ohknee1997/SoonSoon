import React, { useState, useEffect } from 'react';
import { CardData, EngineData, TabConfig, CardDetail, UserProfile } from '../../types';
import { copyTextToClipboard } from '../../utils';
import { trackOfferClick } from '../../utils/userAnalytics';
import { WiiFaceIcon } from '../WiiFaceIcon';
import { getAvatarById } from '../../data/wiiAvatars';
import {
  Gamepad2,
  Zap,
  Flame,
  Key,
  Unlock,
  Copy,
  Check,
  ExternalLink,
  Timer,
  Trophy,
  Sparkles,
  Search,
} from 'lucide-react';

interface GamifiedPunchyViewProps {
  cards: CardData[];
  tabs: TabConfig[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  engines: EngineData[];
  details: Record<string, CardDetail>;
  onToggleDrawer: (card: CardData) => void;
  onEditCard: (card: CardData) => void;
  isEditing: boolean;
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenOnboarding: () => void;
}

export const GamifiedPunchyView: React.FC<GamifiedPunchyViewProps> = ({
  cards,
  tabs,
  activeTabId,
  onSelectTab,
  onToggleDrawer,
  onEditCard,
  isEditing,
  userProfile,
  onOpenProfile,
  onOpenOnboarding,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 42,
    seconds: 18,
  });

  // Simulated live boost countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (e: React.MouseEvent, card: CardData) => {
    e.stopPropagation();
    if (!card.code) return;
    copyTextToClipboard(card.code).then((success) => {
      if (success) {
        setCopiedCodeId(card.id);
        setTimeout(() => setCopiedCodeId(null), 1800);
      }
    });
  };

  const handleCardClick = (card: CardData) => {
    if (isEditing) {
      onEditCard(card);
      return;
    }
    if (card.tabId === 'fast-easy-money' || card.hideSecretSauce) {
      if (card.signupUrl) {
        window.open(card.signupUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    try {
      const active = localStorage.getItem('ohknee.active.account.user.v2');
      const username = active ? JSON.parse(active) : 'guest';
      trackOfferClick(username, card.name, 'drawer');
    } catch {}
    onToggleDrawer(card);
  };

  const handleSignUpClick = (e: React.MouseEvent, card: CardData) => {
    e.stopPropagation();
    if (isEditing) {
      onEditCard(card);
      return;
    }
    try {
      const active = localStorage.getItem('ohknee.active.account.user.v2');
      const username = active ? JSON.parse(active) : 'guest';
      trackOfferClick(username, card.name, 'signup');
    } catch {}
  };

  const filteredCards = cards.filter((c) => {
    const matchesTab = activeTabId === 'all' ? true : c.tabId === activeTabId;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.sub && c.sub.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 font-sans pb-28 selection:bg-orange-500 selection:text-black">
      {/* Cyber Grid Background lines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, #f97316 1px, transparent 1px), linear-gradient(to bottom, #f97316 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Gamified Punchy App Header */}
      <div className="bg-[#10131c]/95 backdrop-blur-xl border-b-2 border-orange-500/40 px-4 pt-3 pb-3 sticky top-[73px] z-30 shadow-[0_10px_30px_rgba(249,115,22,0.15)]">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 p-0.5 shadow-[0_0_15px_rgba(249,115,22,0.6)] flex items-center justify-center rotate-[-3deg]">
              <Gamepad2 className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-wider uppercase text-white font-mono">
                  GYM LOOT
                </span>
                <span className="px-1.5 py-0.2 rounded bg-orange-500 text-black text-[9px] font-black uppercase tracking-widest">
                  LVL 12
                </span>
              </div>
              <p className="text-[10px] text-orange-400 font-mono tracking-tight font-bold">
                ⚡ HIGH-ENERGY DEAL ARENA
              </p>
            </div>
          </div>

          {/* User Profile / Level status */}
          {userProfile ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-[#1b2030] hover:bg-[#232b40] border-2 border-orange-500/50 p-1.5 pr-2.5 rounded-xl transition cursor-pointer shadow-[2px_2px_0px_#f97316]"
            >
              <WiiFaceIcon
                avatar={getAvatarById(userProfile.avatarId)}
                customPfpUrl={userProfile.customPfpUrl}
                size={24}
              />
              <span className="text-xs font-black text-orange-300 font-mono">@{userProfile.username}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black text-xs font-black transition shadow-[0_0_15px_rgba(249,115,22,0.5)] cursor-pointer font-mono"
            >
              CLAIM AVATAR 🎮
            </button>
          )}
        </div>

        {/* Gamified XP & Boost Progress Bar */}
        <div className="bg-[#181d2a] border border-orange-500/30 rounded-xl p-2 mb-2.5 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px] font-mono font-black mb-1">
                <span className="text-orange-400 uppercase">Season 4 Loot Rush</span>
                <span className="text-emerald-400">4,850 / 5,000 XP</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 w-[88%] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg border border-orange-500/30 text-amber-300 text-[10px] font-mono font-black">
            <Timer className="w-3 h-3 text-orange-400" />
            <span>
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Neo-brutalist Search Bar */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search loot codes, double bonus perks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161a26] border-2 border-orange-500/40 focus:border-orange-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono transition"
          />
        </div>

        {/* Tab Badges Grid */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const count = cards.filter((c) => c.tabId === tab.id && !c.hidden).length;
            const isRedTab = tab.id === 'fast-easy-money';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer font-mono uppercase tracking-wider ${
                  isActive
                    ? isRedTab
                      ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.8)] border-2 border-white'
                      : 'bg-gradient-to-r from-orange-500 to-amber-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.7)] border-2 border-orange-300'
                    : 'bg-[#181d2a] text-slate-300 hover:bg-[#202738] border border-orange-500/20'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-black">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Loot Chest Banner */}
      <div className="px-4 pt-4 pb-1">
        <div className="bg-gradient-to-r from-orange-950/80 via-[#24142e]/80 to-amber-950/80 border-2 border-orange-500/50 rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_20px_rgba(249,115,22,0.25)] relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 uppercase font-mono tracking-wide">
                  🔥 LEGENDARY LOOT VAULT
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">100% verified instant cash & code keys</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-black text-xs font-black font-mono">
            {filteredCards.length} KEYS
          </span>
        </div>
      </div>

      {/* Gamified Interactive Cards Feed */}
      <div className="px-4 py-3 space-y-3">
        {filteredCards.map((card) => {
          const hasOrder = card.orderNumber !== undefined && card.orderNumber !== null;
          const isCopied = copiedCodeId === card.id;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="relative bg-[#131722] hover:bg-[#1a2030] border-2 border-orange-500/30 hover:border-orange-400 rounded-2xl p-3.5 shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all duration-200 cursor-pointer overflow-hidden group"
            >
              {/* Top Golden 5-Star Banner */}
              {card.showStarsTopper && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-[9px] px-3 py-0.5 rounded-bl-xl font-mono uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                  <span>★★★★★</span>
                  <span>GOD-TIER</span>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* 3D Tactile Tile */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-[#1d2334] border-2 border-orange-500/40 p-1.5 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] overflow-hidden group-hover:scale-105 transition">
                    {card.customImg || card.logoUrl || card.domain ? (
                      <img
                        src={card.customImg || card.logoUrl || `https://www.google.com/s2/favicons?domain=${card.domain}&sz=256`}
                        alt={card.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(249,115,22,0.3)]"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-orange-400 font-black text-xl font-mono">
                        {card.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {hasOrder && (
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-lg bg-orange-500 text-black font-mono text-[11px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.8)] border border-white">
                      #{card.orderNumber}
                    </span>
                  )}
                </div>

                {/* Offer Details */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-white text-base font-mono tracking-tight uppercase truncate">
                      {card.name}
                    </h3>
                  </div>

                  {card.sub && (
                    <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">{card.sub}</p>
                  )}

                  {/* Punchy Neon Tag */}
                  {card.payout && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-500/50 text-orange-200 text-[11px] font-black font-mono tracking-tight">
                        <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                        <span>{card.payout}</span>
                      </div>
                      {card.instructionSub && (
                        <div className="text-[11px] font-mono font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-md">
                          {card.instructionSub}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Loot Keycard Code Bar & Unlock Button */}
              <div className="mt-3 pt-2.5 border-t border-orange-500/20 flex items-center justify-between gap-2">
                {card.code ? (
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(e, card)}
                    className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border-2 font-mono font-black text-xs transition cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                        : 'bg-[#0b0e17] hover:bg-[#151b2c] border-orange-500/40 text-orange-300 shadow-inner'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Key className="w-3.5 h-3.5 text-orange-400" />
                      <span className="truncate">{card.code}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 ml-1 text-orange-400">
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : 'COPY'}
                    </span>
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-slate-400 font-bold px-1">⚡ INSTANT DROP BONUS</div>
                )}

                {/* Tactile Unlock Loot Button */}
                <a
                  href={card.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleSignUpClick(e, card)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.5)] whitespace-nowrap cursor-pointer font-mono uppercase tracking-wider"
                >
                  <span>UNLOCK</span>
                  <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
