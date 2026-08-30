import React, { useState } from 'react';
import { CardData, EngineData, TabConfig, CardDetail, UserProfile } from '../../types';
import { copyTextToClipboard } from '../../utils';
import { trackOfferClick } from '../../utils/userAnalytics';
import { WiiFaceIcon } from '../WiiFaceIcon';
import { getAvatarById } from '../../data/wiiAvatars';
import { Search, Copy, Check, ExternalLink, Sparkles, Flame, Star, ShieldCheck, ChevronRight } from 'lucide-react';

interface CleanContemporaryViewProps {
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

export const CleanContemporaryView: React.FC<CleanContemporaryViewProps> = ({
  cards,
  tabs,
  activeTabId,
  onSelectTab,
  details,
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

  // Filter cards by tab and search
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
    <div className="min-h-screen bg-[#111317] text-slate-100 font-sans pb-24 selection:bg-emerald-500 selection:text-slate-950">
      {/* Contemporary App Bar */}
      <div className="bg-[#181b20]/90 backdrop-blur-xl border-b border-white/5 px-4 pt-3 pb-3 sticky top-[73px] z-30 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">Gym Loot</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Clean contemporary rewards hub</p>
            </div>
          </div>

          {/* User Profile avatar / sign in button */}
          {userProfile ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-[#222730] hover:bg-[#2a303c] border border-white/10 p-1.5 pr-2.5 rounded-xl transition cursor-pointer"
            >
              <WiiFaceIcon
                avatar={getAvatarById(userProfile.avatarId)}
                customPfpUrl={userProfile.customPfpUrl}
                size={24}
              />
              <span className="text-xs font-bold text-slate-200">@{userProfile.username}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Join Club
            </button>
          )}
        </div>

        {/* Contemporary Search Input */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search verified promo codes, brands, bonuses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111317] border border-white/10 focus:border-emerald-400/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Tab Pills Carousel */}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? isRedTab
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-[1.02]'
                    : 'bg-[#222730] text-slate-300 hover:bg-[#2a303c] border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive
                      ? isRedTab
                        ? 'bg-black/30 text-white'
                        : 'bg-slate-950/20 text-slate-950'
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

      {/* Featured Header Pill Stats */}
      <div className="px-4 pt-4 pb-1">
        <div className="bg-gradient-to-r from-[#181b20] via-[#1f242c] to-[#181b20] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white">Active Verified Deals</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">Instant code copy & direct bonuses</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-emerald-400">{filteredCards.length}</span>
            <span className="text-[10px] block text-slate-400 uppercase font-bold tracking-wider">Offers</span>
          </div>
        </div>
      </div>

      {/* Floating Glassmorphism Cards Feed */}
      <div className="px-4 py-3 space-y-3">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12 bg-[#181b20] rounded-2xl border border-white/5 p-6">
            <p className="text-slate-400 text-sm">No offers match your query.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
            >
              Reset Search
            </button>
          </div>
        ) : (
          filteredCards.map((card) => {
            const hasOrder = card.orderNumber !== undefined && card.orderNumber !== null;
            const isCopied = copiedCodeId === card.id;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="group relative bg-[#181b20]/90 hover:bg-[#1e232a] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3.5 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-md"
              >
                {/* 5-Star Golden Header if enabled */}
                {card.showStarsTopper && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-bl-xl shadow flex items-center gap-0.5 uppercase tracking-wider">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span className="ml-1 text-[8px] font-extrabold text-black">Top Pick</span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Logo Container */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-[#222730] border border-white/10 p-1.5 flex items-center justify-center shadow-inner overflow-hidden">
                      {card.logoUrl || card.customImg ? (
                        <img
                          src={card.customImg || card.logoUrl}
                          alt={card.name}
                          className="w-full h-full object-contain filter drop-shadow"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-emerald-400 font-extrabold text-lg">
                          {card.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Order Badge */}
                    {hasOrder && (
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-md bg-slate-950 border border-emerald-400 text-emerald-400 font-mono text-[10px] font-black flex items-center justify-center shadow">
                        #{card.orderNumber}
                      </span>
                    )}
                  </div>

                  {/* Offer Info */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-white text-sm tracking-tight truncate">
                        {card.name}
                      </h3>
                      {card.rating && (
                        <div className="flex items-center text-amber-400 text-[10px]">
                          {Array.from({ length: card.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {card.sub && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{card.sub}</p>
                    )}

                    {/* Payout / Bonus Tag */}
                    {card.payout && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold tracking-tight">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        <span>{card.payout}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promo Code & Action Bar */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                  {card.code ? (
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, card)}
                      className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-[#111317] hover:bg-[#161a20] border-white/10 text-slate-200'
                      }`}
                    >
                      <span className="truncate mr-1">{card.code}</span>
                      <span className="text-[10px] text-emerald-400 uppercase font-sans font-bold flex items-center gap-1">
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic px-1">Direct Link Bonus</div>
                  )}

                  {/* Direct Signup Button */}
                  <a
                    href={card.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleSignUpClick(e, card)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1 shadow-lg shadow-emerald-500/20 whitespace-nowrap cursor-pointer"
                  >
                    <span>{card.signupLabel || 'Claim Code'}</span>
                    <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
