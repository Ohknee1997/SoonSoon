import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  isUsernameTaken,
  getAccountByUsername,
  loginUser,
  canLoginUsername,
} from '../data/wiiAvatars';

interface UsernameOnboardingModalProps {
  isOpen: boolean;
  onUsernameSubmitted: (username: string, email: string, password: string) => void;
  onLoggedIn: (profile: UserProfile) => void;
}

export const UsernameOnboardingModal: React.FC<UsernameOnboardingModalProps> = ({
  isOpen,
  onUsernameSubmitted,
  onLoggedIn,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim();
    const cleanEmail = email.trim();

    if (!clean) {
      setError('Please enter a username.');
      return;
    }
    if (clean.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (clean.length > 16) {
      setError('Username cannot exceed 16 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      setError('Only letters, numbers, and underscores are allowed.');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!password || password.length < 3) {
      setError('Please choose a password with at least 3 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    // Check if account already exists with password
    const existingAccount = getAccountByUsername(clean);
    if (existingAccount) {
      setError(`An account for @${clean} already exists. Click "Sign In" above to log in.`);
      return;
    }

    // Check if it's reserved or already taken
    if (isUsernameTaken(clean)) {
      if (canLoginUsername(clean)) {
        setInfoMessage(`Securing @${clean} with your new password...`);
      } else {
        setError(`"${clean}" is reserved. Please choose another handle.`);
        return;
      }
    }

    // Pass chosen username, email & password to proceed to Avatar Wheel spin
    onUsernameSubmitted(clean, cleanEmail, password);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim();

    if (!clean) {
      setError('Please enter your username to sign in.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const result = loginUser(clean, password);

    if (result.success) {
      if (result.profile) {
        onLoggedIn(result.profile);
      } else if (result.isLegacyClaim) {
        // Legacy handle claiming with password
        onUsernameSubmitted(clean, email || 'user@ohknee.app', password);
      }
    } else {
      setError(result.error || 'Failed to sign in.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      id="username-onboarding-modal"
    >
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-cyan-500/20 text-center overflow-hidden">
        {/* Top Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 text-xs font-bold tracking-wider uppercase">
          <span>🎮</span>
          <span>OHKNEE REWARD NETWORK</span>
        </div>

        {/* Auth Mode Switcher */}
        <div className="flex items-center justify-center p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-5 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setInfoMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setInfoMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
          {mode === 'signup' ? 'Create Your Account' : 'Sign In to Your Account'}
        </h2>
        <p className="text-slate-300 text-xs md:text-sm mb-5 leading-relaxed">
          {mode === 'signup'
            ? 'Enter your handle, email, and password to save your balance, cosmetics, and unique Avatar.'
            : 'Welcome back! Enter your handle and password to access your Avatar and reward lounge.'}
        </p>

        {mode === 'signup' ? (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-3 text-left">
            <div>
              <label
                htmlFor="onboarding-username-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
              >
                Username Handle
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-sm font-bold">
                  @
                </span>
                <input
                  id="onboarding-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ohknee"
                  maxLength={16}
                  autoFocus
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-700/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl text-white font-medium placeholder:text-slate-600 outline-none text-sm transition"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5 px-1">
                <span>Letters, numbers & underscores</span>
                <span>{username.length}/16</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="onboarding-email-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  ✉️
                </span>
                <input
                  id="onboarding-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="yourname@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl text-white font-medium placeholder:text-slate-600 outline-none text-sm transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="onboarding-password-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
              >
                Choose Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  🔑
                </span>
                <input
                  id="onboarding-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter a secure password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl text-white font-medium placeholder:text-slate-600 outline-none text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="onboarding-confirm-password-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  🔒
                </span>
                <input
                  id="onboarding-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Re-type your password"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl text-white font-medium placeholder:text-slate-600 outline-none text-sm transition"
                />
              </div>
            </div>

            {infoMessage && (
              <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs flex items-center gap-2">
                <span>ℹ️</span>
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!username.trim() || !email.trim() || !password}
                className="w-full py-3 px-6 rounded-xl font-black text-slate-950 text-sm bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 active:scale-[0.98] transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Save Account & Spin Avatar Wheel</span>
                <span>🎡</span>
              </button>
            </div>
          </form>
        ) : (
          /* SIGN IN FORM */
          <form onSubmit={handleSignIn} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="login-username-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Your Handle
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-sm font-bold">
                  @
                </span>
                <input
                  id="login-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ohknee"
                  maxLength={16}
                  autoFocus
                  className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-700/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl text-white font-medium placeholder:text-slate-600 outline-none text-sm transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password-input"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  🔑
                </span>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-3 bg-slate-950 border border-slate-700/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl text-white font-medium placeholder:text-slate-600 outline-none text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!username.trim() || !password}
                className="w-full py-3.5 px-6 rounded-xl font-black text-slate-950 text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-[0.98] transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign In & Enter Lounge</span>
                <span>🚀</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">🔒 Password Encrypted</span>
          <span className="flex items-center gap-1">💾 Auto-Saved</span>
          <span className="flex items-center gap-1">🎮 1-of-1 Avatars</span>
        </div>
      </div>
    </div>
  );
};
