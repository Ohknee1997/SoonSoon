import React, { useState } from 'react';
import { CardData, EngineData, TabConfig, CardDetail, UserProfile } from '../../types';
import { copyTextToClipboard } from '../../utils';
import { trackOfferClick } from '../../utils/userAnalytics';
import { WiiFaceIcon } from '../WiiFaceIcon';
import { getAvatarById } from '../../data/wiiAvatars';
import {
  Landmark,
  TrendingUp,
  ArrowUpRight,
  Copy,
  Check,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  CreditCard,
  Lock,
} from 'lucide-react';

interface MinimalFintechViewProps {
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

export const MinimalFintechView: React.FC<MinimalFintechViewProps> = ({
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
    <div className="min-h-screen bg-[#08090b] text-slate-100 font-sans pb-28 selection:bg-slate-200 selection:text-black">
      {/* FinTech Matte Header */}
      <div className="bg-[#0e1014]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 pt-3 pb-3 sticky top-[73px] z-30 shadow-md">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100">
              <Landmark className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-100 font-sans">
                  Gym Loot
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                  BLACK
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Fintech Cashback & Merchant Discovery</p>
            </div>
          </div>

          {/* User Account / Profile */}
          {userProfile ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 pr-2.5 rounded-full transition cursor-pointer"
            >
              <WiiFaceIcon
                avatar={getAvatarById(userProfile.avatarId)}
                customPfpUrl={userProfile.customPfpUrl}
                size={22}
              />
              <span className="text-xs font-semibold text-slate-300">@{userProfile.username}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Log In
            </button>
          )}
        </div>

        {/* Minimal Search Bar */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search merchants, bonuses, or promo codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14171d] border border-slate-800 focus:border-slate-600 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Brushed Slate Tab Filter */}
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? isRedTab
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-white text-slate-950 font-bold shadow-md'
                    : 'bg-[#14171d] text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isActive
                      ? isRedTab
                        ? 'bg-black/30 text-white'
                        : 'bg-slate-200 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FinTech Top Balance / Portfolio Summary Card */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-gradient-to-b from-[#13161c] to-[#0f1115] border border-slate-800/90 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Estimated Total Rewards Portfolio
            </span>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              <span>100% Instant Claim</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-extrabold text-white tracking-tight font-sans">$2,850.00+</span>
            <span className="text-xs text-slate-400">across {filteredCards.length} verified tiers</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800/80 text-xs">
            <div className="bg-[#181b22] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Daily Rakeback</span>
              <span className="font-bold text-slate-200">Active &bull; 24/7</span>
            </div>
            <div className="bg-[#181b22] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">No-Deposit Bonuses</span>
              <span className="font-bold text-emerald-400">$50.00 Instant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Vertical Merchant Feed */}
      <div className="px-4 py-2 space-y-2.5">
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Verified Partner Offers ({filteredCards.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">1-Tap Copy</span>
        </div>

        {filteredCards.map((card) => {
          const hasOrder = card.orderNumber !== undefined && card.orderNumber !== null;
          const isCopied = copiedCodeId === card.id;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="bg-[#101318] hover:bg-[#151920] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-3.5 transition-all duration-200 cursor-pointer shadow-sm relative group"
            >
              {/* Subtle Golden 5-Star Banner if enabled */}
              {card.showStarsTopper && (
                <div className="absolute top-0 right-0 bg-amber-500/15 border-b border-l border-amber-500/30 text-amber-300 font-bold text-[9px] px-2.5 py-0.5 rounded-bl-xl flex items-center gap-1">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="text-[8px] uppercase tracking-wider">Fintech Pick</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Clean Merchant Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-[#161a22] border border-slate-700/80 p-1.5 flex items-center justify-center shadow-md overflow-hidden">
                    {card.customImg || card.logoUrl || card.domain ? (
                      <img
                        src={card.customImg || card.logoUrl || `https://www.google.com/s2/favicons?domain=${card.domain}&sz=256`}
                        alt={card.name}
                        className="w-full h-full object-contain filter drop-shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-slate-200 font-bold text-sm">
                        {card.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {hasOrder && (
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      #{card.orderNumber}
                    </span>
                  )}
                </div>

                {/* Offer Headline */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-white text-sm tracking-tight truncate">
                      {card.name}
                    </h3>
                  </div>

                  {card.sub && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{card.sub}</p>
                  )}

                  {card.payout && (
                    <div className="mt-1 flex flex-col gap-1">
                      <span className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {card.payout}
                      </span>
                      {card.instructionSub && (
                        <span className="inline-block text-[11px] font-medium text-slate-100 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-700/80">
                          {card.instructionSub}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Instant Copy & Action Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {card.code ? (
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(e, card)}
                    className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#14171e] hover:bg-[#1a1f28] border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate mr-1 font-bold">{card.code}</span>
                    <span className="text-[10px] text-slate-400 font-sans font-semibold flex items-center gap-1">
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </span>
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500 italic px-1">Exclusive Link Offer</div>
                )}

                <a
                  href={card.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleSignUpClick(e, card)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-sm whitespace-nowrap cursor-pointer"
                >
                  <span>{card.signupLabel || 'Claim'}</span>
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
