import React, { useState } from 'react';
import { UserProfile, ShopItem, WiiAvatar } from '../types';
import { getAvatarById, syncUserProfile, logoutUser, getAccountByUsername, saveAccount } from '../data/wiiAvatars';
import { WiiFaceIcon } from './WiiFaceIcon';
import { SHOP_ITEMS, getTransactions } from '../data/shopData';
import { playCustomChatSound } from '../audioUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  userProfile: UserProfile | null;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenShopItem: (item: ShopItem) => void;
  onOpenAvatarSpinner: () => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  userProfile,
  onClose,
  onProfileUpdated,
  onOpenShopItem,
  onOpenAvatarSpinner,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'inventory' | 'history' | 'security'>('profile');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [customPfpInput, setCustomPfpInput] = useState('');
  const [showPfpInput, setShowPfpInput] = useState(false);

  // Security password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  if (!isOpen || !userProfile) return null;

  const currentAvatar = getAvatarById(userProfile.avatarId);
  const unlocked = userProfile.unlockedItems || [];
  const transactions = getTransactions();
  const account = getAccountByUsername(userProfile.username);

  const handleSaveUsername = () => {
    const clean = newUsernameInput.trim();
    if (!clean || clean.length < 3) return;

    const updated = {
      ...userProfile,
      username: clean,
    };
    syncUserProfile(updated);
    onProfileUpdated(updated);
    setIsEditingUsername(false);
    playCustomChatSound('cash');
  };

  const handleSaveCustomPfp = () => {
    const clean = customPfpInput.trim();
    if (!clean) return;

    const updated = {
      ...userProfile,
      customPfpUrl: clean,
    };
    syncUserProfile(updated);
    onProfileUpdated(updated);
    setShowPfpInput(false);
    playCustomChatSound('cash');
  };

  const handleResetToWiiAvatar = () => {
    const updated = {
      ...userProfile,
      customPfpUrl: undefined,
    };
    syncUserProfile(updated);
    onProfileUpdated(updated);
    playCustomChatSound('wii');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 3) {
      setPasswordFeedback('Password must be at least 3 characters.');
      return;
    }
    if (account) {
      account.passwordHash = btoa(newPassword);
      saveAccount(account);
      setPasswordFeedback('Password successfully updated!');
      setNewPassword('');
      playCustomChatSound('crystal');
    }
  };

  const handleSignOut = () => {
    logoutUser();
    onClose();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10008] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      id="user-profile-modal"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 md:p-7 text-white shadow-2xl shadow-cyan-500/20 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            👤 Profile & Avatar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🎒 Cosmetics ({unlocked.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📜 Crypto Ledger ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔒 Account & Security
          </button>
        </div>

        {/* TAB 1: PROFILE & AVATAR */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* Avatar Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="relative">
                <WiiFaceIcon
                  avatar={currentAvatar}
                  customPfpUrl={userProfile.customPfpUrl}
                  size={76}
                  frame={userProfile.equippedFrame}
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-[10px] font-black text-slate-950">
                  #{String(currentAvatar?.number || 1).padStart(3, '0')}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-lg font-black text-white truncate">
                    @{userProfile.username}
                  </span>
                  {userProfile.equippedBadge && (
                    <span className="text-base">
                      {SHOP_ITEMS.find((i) => i.id === userProfile.equippedBadge)?.icon || '👑'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-1">
                  # Identity: <strong className="text-amber-300">Slot #{String(currentAvatar?.number || 1).padStart(3, '0')}</strong> ({currentAvatar?.vibe || 'Console'} Style)
                </p>
                {userProfile.email && (
                  <p className="text-[11px] text-slate-500 mb-2 font-mono truncate">
                    📧 {userProfile.email}
                  </p>
                )}

                {userProfile.customPfpUrl && (
                  <button
                    type="button"
                    onClick={handleResetToWiiAvatar}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer block mt-1"
                  >
                    ↺ Reset to original unique Avatar
                  </button>
                )}
              </div>
            </div>

            {/* Account Details & Status */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Status</span>
                <span className="text-emerald-400 font-bold">Active Member</span>
              </div>
            </div>

            {/* Core Micro-Actions */}
            <div className="space-y-2 pt-1">
              {/* Change Username Option */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-white block">Change Handle</span>
                  <span className="text-[11px] text-slate-400">Update your username handle</span>
                </div>
                {!isEditingUsername ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingUsername(true);
                      setNewUsernameInput(userProfile.username);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newUsernameInput}
                      onChange={(e) => setNewUsernameInput(e.target.value)}
                      maxLength={16}
                      className="px-2 py-1 bg-slate-900 border border-cyan-500 rounded text-xs text-white w-28 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveUsername}
                      className="px-2 py-1 bg-cyan-500 text-slate-950 rounded text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Custom PFP Option */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-white block">Custom PFP Image</span>
                  <span className="text-[11px] text-slate-400">Set custom profile picture URL</span>
                </div>
                {!showPfpInput ? (
                  <button
                    type="button"
                    onClick={() => setShowPfpInput(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                  >
                    Update URL
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Image URL..."
                      value={customPfpInput}
                      onChange={(e) => setCustomPfpInput(e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-cyan-500 rounded text-xs text-white w-32 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomPfp}
                      className="px-2 py-1 bg-cyan-500 text-slate-950 rounded text-xs font-bold"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & COSMETICS */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <span className="text-xs text-slate-400 block mb-2">
              Toggle and equip your unlocked micro-items:
            </span>
            {SHOP_ITEMS.filter((item) => unlocked.includes(item.id)).map((item) => {
              const isEquipped =
                userProfile.equippedBadge === item.id ||
                userProfile.equippedGlow === item.id ||
                userProfile.equippedFont === item.id ||
                userProfile.equippedBubble === item.id ||
                userProfile.equippedSound === item.id ||
                userProfile.equippedPet === item.id ||
                userProfile.equippedFrame === item.id;

              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.description}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isEquipped ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>
                    {isEquipped ? 'Active' : 'Equipped elsewhere'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No on-chain crypto transactions recorded yet.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{tx.itemName}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {tx.cryptoAmount} (${tx.usdAmount.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>TX: {tx.txHash.slice(0, 18)}...</span>
                    <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* TAB 4: ACCOUNT & SECURITY */}
        {activeTab === 'security' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* Account Overview Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Handle</span>
                  <span className="text-base font-black text-cyan-400">@{userProfile.username}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Status</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    <span>✓</span>
                    <span>Active & Saved</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 text-xs text-slate-400">
                Created: {new Date(userProfile.createdAt || Date.now()).toLocaleDateString()} • Account data is securely persisted on this device.
              </div>
            </div>

            {/* Change / Update Password Form */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Update Account Password
              </h4>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 3 chars)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl text-xs text-white outline-none"
                  />
                </div>
                {passwordFeedback && (
                  <div className="text-xs text-cyan-300 bg-cyan-950/60 p-2 rounded-lg border border-cyan-500/40">
                    {passwordFeedback}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!newPassword}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition cursor-pointer"
                >
                  Save New Password
                </button>
              </form>
            </div>

            {/* Sign Out / Switch Account Button */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Sign Out of Session</span>
                <span className="text-[11px] text-slate-400">Switch user account or log back in anytime</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
