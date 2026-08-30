import React, { useState } from 'react';
import { ShopItem, UserProfile } from '../types';
import { CRYPTO_OPTIONS, logTransaction } from '../data/shopData';
import { copyTextToClipboard, saveToStorage } from '../utils';
import { STORE_USER_PROFILE } from '../data/wiiAvatars';
import { playCustomChatSound } from '../audioUtils';

interface CryptoCheckoutModalProps {
  item: ShopItem | null;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (updatedProfile: UserProfile, item: ShopItem) => void;
}

export const CryptoCheckoutModal: React.FC<CryptoCheckoutModalProps> = ({
  item,
  userProfile,
  isOpen,
  onClose,
  onPurchaseSuccess,
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const cryptoAmount = (item.price / selectedCrypto.rateToUsd).toFixed(
    selectedCrypto.symbol === 'BTC' ? 8 : selectedCrypto.symbol === 'ETH' ? 6 : 4
  );

  const hasEnoughBalance = (userProfile?.cryptoBalance || 0) >= item.price;

  const handleCopyAddress = async () => {
    const ok = await copyTextToClipboard(selectedCrypto.address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const executePurchase = (method: 'balance' | 'external') => {
    if (!userProfile) return;
    setIsProcessing(true);

    setTimeout(() => {
      let updatedProfile = { ...userProfile };

      if (method === 'balance') {
        updatedProfile.cryptoBalance = Math.max(0, updatedProfile.cryptoBalance - item.price);
      }

      // Handle specific item types
      if (item.category === 'boosters' || item.id === 'core-spin-booster') {
        updatedProfile.spinBoosters = (updatedProfile.spinBoosters || 0) + 1;
      }

      // Add to unlocked inventory if not already
      if (!updatedProfile.unlockedItems.includes(item.id)) {
        updatedProfile.unlockedItems = [...updatedProfile.unlockedItems, item.id];
      }

      // Auto-equip based on category
      if (item.category === 'badges') {
        updatedProfile.equippedBadge = item.id;
      } else if (item.category === 'glows') {
        updatedProfile.equippedGlow = item.id;
      } else if (item.category === 'fonts') {
        updatedProfile.equippedFont = item.id;
      } else if (item.category === 'bubbles') {
        updatedProfile.equippedBubble = item.id;
      } else if (item.category === 'sounds') {
        updatedProfile.equippedSound = item.id;
      } else if (item.category === 'pets') {
        updatedProfile.equippedPet = item.id;
      } else if (item.category === 'frames') {
        updatedProfile.equippedFrame = item.id;
      }

      saveToStorage(STORE_USER_PROFILE, updatedProfile);

      // Log transaction
      const tx = logTransaction({
        itemId: item.id,
        itemName: item.name,
        usdAmount: item.price,
        cryptoAmount: `${cryptoAmount} ${selectedCrypto.symbol}`,
        cryptoCurrency: selectedCrypto.symbol,
      });

      playCustomChatSound('cash');
      setIsProcessing(false);
      setTxSuccess(tx.txHash);

      setTimeout(() => {
        setTxSuccess(null);
        onPurchaseSuccess(updatedProfile, item);
      }, 1200);
    }, 1000);
  };

  const handleClaimFaucet = () => {
    if (!userProfile) return;
    const updated = {
      ...userProfile,
      cryptoBalance: (userProfile.cryptoBalance || 0) + 5.0,
    };
    saveToStorage(STORE_USER_PROFILE, updated);
    playCustomChatSound('cash');
    onPurchaseSuccess(updated, item);
  };

  return (
    <div
      className="fixed inset-0 z-[10005] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      id="crypto-checkout-modal"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 md:p-7 text-white shadow-2xl shadow-cyan-500/20">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl">
            {item.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              CRYPTO MICRO-PURCHASE
            </span>
            <h3 className="text-xl font-extrabold text-white">{item.name}</h3>
          </div>
        </div>

        {/* Item details and price banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            <span className="block font-semibold text-white">{item.description}</span>
            <span className="text-[11px] text-slate-400">Instant unlock & equipped</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-amber-400">${item.price.toFixed(2)}</div>
            <div className="text-[10px] text-cyan-300 font-mono">Crypto Payment</div>
          </div>
        </div>

        {/* User Balance Bar & Quick Faucet */}
        <div className="mb-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Your Crypto Balance:</span>
            <span className="font-bold text-emerald-400 text-sm">
              ${(userProfile?.cryptoBalance || 0).toFixed(2)} USD
            </span>
          </div>
          <button
            type="button"
            onClick={handleClaimFaucet}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            title="Add $5.00 test crypto to try out items"
          >
            <span>💧 Free Faucet +$5.00</span>
          </button>
        </div>

        {/* Select Payment Network */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Crypto Currency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CRYPTO_OPTIONS.map((crypto) => (
              <button
                key={crypto.symbol}
                type="button"
                onClick={() => setSelectedCrypto(crypto)}
                className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                  selectedCrypto.symbol === crypto.symbol
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{crypto.icon}</span>
                <div>
                  <div className="font-bold text-xs leading-none">{crypto.symbol}</div>
                  <div className="text-[9px] text-slate-400">{crypto.network.split(' ')[0]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Amount & QR / Address Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Total to Send:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {cryptoAmount} {selectedCrypto.symbol}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={selectedCrypto.address}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-mono text-slate-300 truncate select-all outline-none"
            />
            <button
              type="button"
              onClick={handleCopyAddress}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition shrink-0 cursor-pointer"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Transaction Success Overlay */}
        {txSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center animate-scaleUp">
            <div className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-1.5 mb-0.5">
              <span>✅</span>
              <span>Payment Confirmed on Chain!</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              TX: {txSuccess.slice(0, 16)}...
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {hasEnoughBalance ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => executePurchase('balance')}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 active:scale-98 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isProcessing ? 'Confirming on Chain...' : `1-Click Pay ($${item.price.toFixed(2)} USD)`}</span>
              <span>⚡</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => executePurchase('external')}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 active:scale-98 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isProcessing ? 'Verifying Block Transaction...' : 'Simulate Web3 Crypto Payment'}</span>
              <span>🔗</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
