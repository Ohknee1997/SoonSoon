import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getAvatarById, syncUserProfile, logoutUser, getAccountByUsername, saveAccount } from '../data/wiiAvatars';
import { WiiFaceIcon } from './WiiFaceIcon';
import { playCustomChatSound } from '../audioUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  userProfile: UserProfile | null;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  userProfile,
  onClose,
  onProfileUpdated,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [customPfpInput, setCustomPfpInput] = useState('');
  const [showPfpInput, setShowPfpInput] = useState(false);

  // Security password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  if (!isOpen || !userProfile) return null;

  const currentAvatar = getAvatarById(userProfile.avatarId);
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
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 md:p-7 text-white shadow-2xl shadow-cyan-500/20 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close"
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
                </div>

                <p className="text-xs text-slate-400 mb-1">
                  Avatar Identity: <strong className="text-amber-300">Slot #{String(currentAvatar?.number || 1).padStart(3, '0')}</strong> ({currentAvatar?.vibe || 'Console'} Style)
                </p>
                <p className="text-[11px] text-slate-500">
                  Registered: {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active Member'}
                </p>
              </div>
            </div>

            {/* Custom Avatar / Photo */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Profile Picture Customization</span>
                {userProfile.customPfpUrl && (
                  <button
                    type="button"
                    onClick={handleResetToWiiAvatar}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Reset to Assigned Avatar
                  </button>
                )}
              </div>

              {!showPfpInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setCustomPfpInput(userProfile.customPfpUrl || '');
                    setShowPfpInput(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer border border-slate-700 flex items-center justify-center gap-2"
                >
                  <span>🖼️</span>
                  <span>Set Custom Image URL</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={customPfpInput}
                    onChange={(e) => setCustomPfpInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveCustomPfp}
                      className="flex-1 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer"
                    >
                      Save Picture
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPfpInput(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Username display / Edit */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Display Username</div>
                  <div className="text-sm font-bold text-white">@{userProfile.username}</div>
                </div>
                {!isEditingUsername ? (
                  <button
                    type="button"
                    onClick={() => {
                      setNewUsernameInput(userProfile.username);
                      setIsEditingUsername(true);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                  >
                    Edit
                  </button>
                ) : null}
              </div>

              {isEditingUsername && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={newUsernameInput}
                    onChange={(e) => setNewUsernameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-white text-xs focus:outline-none"
                    placeholder="New username"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveUsername}
                      className="flex-1 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer"
                    >
                      Save Username
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingUsername(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & ACCOUNT */}
        {activeTab === 'security' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span>🔐</span>
                <span>Account Credentials</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Update the password for @{userProfile.username}.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 3 chars)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {passwordFeedback && (
                  <div
                    className={`text-xs p-2 rounded-lg ${
                      passwordFeedback.includes('successfully')
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-950/70 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {passwordFeedback}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold transition cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-2xl bg-red-950/50 hover:bg-red-900/60 border border-red-600/40 text-red-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                <span>Sign Out of @{userProfile.username}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
