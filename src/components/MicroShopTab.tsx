import React, { useState } from 'react';
import { ShopItem, UserProfile } from '../types';
import { SHOP_ITEMS } from '../data/shopData';
import { saveToStorage } from '../utils';
import { STORE_USER_PROFILE } from '../data/wiiAvatars';
import { playCustomChatSound } from '../audioUtils';

interface MicroShopTabProps {
  userProfile: UserProfile | null;
  onSelectItemToBuy: (item: ShopItem) => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenAvatarSpinner?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🛍️' },
  { id: 'core', label: 'Core / Profile', icon: '⭐' },
  { id: 'badges', label: 'Badges ($0.10)', icon: '👑' },
  { id: 'glows', label: 'Glows ($0.30)', icon: '✨' },
  { id: 'pets', label: 'Pixel Pets ($0.50)', icon: '🐾' },
  { id: 'frames', label: 'Frames ($0.35)', icon: '⭕' },
  { id: 'fonts', label: 'Fonts ($0.25)', icon: '🔤' },
  { id: 'bubbles', label: 'Bubbles ($0.20)', icon: '🫧' },
  { id: 'sounds', label: 'Sounds ($0.10)', icon: '🔊' },
  { id: 'seasonal', label: 'Seasonal ($0.15)', icon: '🌸' },
];

export const MicroShopTab: React.FC<MicroShopTabProps> = ({
  userProfile,
  onSelectItemToBuy,
  onProfileUpdated,
  onOpenAvatarSpinner,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const unlocked = userProfile?.unlockedItems || [];

  const filteredItems = SHOP_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory || (selectedCategory === 'core' && item.isCore);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEquip = (item: ShopItem) => {
    if (!userProfile) return;
    const updated = { ...userProfile };

    if (item.category === 'badges') {
      updated.equippedBadge = updated.equippedBadge === item.id ? undefined : item.id;
    } else if (item.category === 'glows') {
      updated.equippedGlow = updated.equippedGlow === item.id ? undefined : item.id;
    } else if (item.category === 'fonts') {
      updated.equippedFont = updated.equippedFont === item.id ? undefined : item.id;
    } else if (item.category === 'bubbles') {
      updated.equippedBubble = updated.equippedBubble === item.id ? undefined : item.id;
    } else if (item.category === 'sounds') {
      updated.equippedSound = updated.equippedSound === item.id ? undefined : item.id;
    } else if (item.category === 'pets') {
      updated.equippedPet = updated.equippedPet === item.id ? undefined : item.id;
    } else if (item.category === 'frames') {
      updated.equippedFrame = updated.equippedFrame === item.id ? undefined : item.id;
    }

    saveToStorage(STORE_USER_PROFILE, updated);
    playCustomChatSound('crystal');
    onProfileUpdated(updated);
  };

  const isEquipped = (item: ShopItem): boolean => {
    if (!userProfile) return false;
    return (
      userProfile.equippedBadge === item.id ||
      userProfile.equippedGlow === item.id ||
      userProfile.equippedFont === item.id ||
      userProfile.equippedBubble === item.id ||
      userProfile.equippedSound === item.id ||
      userProfile.equippedPet === item.id ||
      userProfile.equippedFrame === item.id
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 text-xs">
      {/* Shop Header Balance Banner */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            MICRO-TRANSACTION VAULT
          </span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-extrabold text-sm">
              ${(userProfile?.cryptoBalance || 0).toFixed(2)} USD
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Crypto Balance</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {userProfile && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
              🎰 {userProfile.spinBoosters || 0} Spins
            </span>
          )}
        </div>
      </div>

      {/* Category Pills Scroller */}
      <div className="px-2.5 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {filteredItems.map((item) => {
          const isOwned = unlocked.includes(item.id);
          const equipped = isEquipped(item);

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                equipped
                  ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                  : isOwned
                  ? 'bg-slate-900/90 border-slate-700/70 hover:border-slate-600'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Left Item Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="font-bold text-white text-xs truncate">{item.name}</span>
                    {equipped && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                        EQUIPPED
                      </span>
                    )}
                    {isOwned && !equipped && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                        OWNED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                </div>
              </div>

              {/* Right Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {isOwned ? (
                  <button
                    type="button"
                    onClick={() => handleEquip(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      equipped
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                        : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
                    }`}
                  >
                    {equipped ? 'Unequip' : 'Equip'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectItemToBuy(item)}
                    className="px-3 py-1.5 rounded-xl font-extrabold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 transition shadow-md shadow-amber-400/20 cursor-pointer flex items-center gap-1"
                  >
                    <span>${item.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-900 font-mono">Crypto</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <span className="text-2xl block mb-1">🔍</span>
            <span>No items found in this category.</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 text-[10px] text-slate-400 text-center flex items-center justify-between">
        <span>⚡ Crypto Micro-Payments (USDT, SOL, BTC)</span>
        <span className="text-cyan-400">🔒 Permanent On-Chain Identity</span>
      </div>
    </div>
  );
};
