import { WiiAvatar } from '../types';
import { getFromStorage, saveToStorage } from '../utils';
import { logAuthEvent, triggerNewLoginAutoResponder } from '../utils/activityLogger';
import { registerUserInAnalytics } from '../utils/userAnalytics';

export const STORE_AVATAR_REGISTRY = 'ohknee.avatar.registry.v2';
export const STORE_WII_REGISTRY = STORE_AVATAR_REGISTRY;
export const STORE_USER_PROFILE = 'ohknee.user.profile.v2';
export const STORE_CLAIMED_USERNAMES = 'ohknee.usernames.registry.v2';
export const STORE_ACCOUNTS_MAP = 'ohknee.accounts.registry.v3';
export const STORE_ACTIVE_ACCOUNT_USER = 'ohknee.active.account.user.v2';

// Seed list of 100 console-style avatars
const HAIR_STYLES = [
  'spiky', 'bowl', 'afro', 'twin-tails', 'side-part', 'bald', 'curly', 'wavy',
  'ponytail', 'slick', 'dreads', 'bun', 'visor', 'mohawk', 'parted-bangs', 'cap'
];

const HAIR_COLORS = [
  '#212121', '#3e2723', '#4e342e', '#ffb300', '#d84315', '#6a1b9a',
  '#1565c0', '#2e7d32', '#8d6e63', '#e0e0e0', '#ef5350', '#00acc1'
];

const SKIN_TONES = [
  '#ffe0bd', '#ffd1b3', '#f0c8a0', '#e0ac69', '#c68642', '#8d5524', '#fbe7d0'
];

const EYE_TYPES = [
  'classic-dots', 'anime-sparkle', 'curved-happy', 'oval-focus', 'wink',
  'glasses-round', 'sunglasses-cool', 'nerd-square'
];

const EYEBROWS = ['straight', 'arched', 'bushy', 'surprised', 'angled'];
const MOUTHS = ['small-smile', 'wide-grin', 'open-laugh', 'neutral', 'mustache-smile', 'goatee'];
const ACCESSORIES = ['none', 'glasses', 'shades', 'beanie', 'cap', 'headband', 'earring', 'blush', 'mole'];
const SHIRT_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#84cc16', '#6366f1', '#14b8a6', '#f97316', '#a855f7'
];

export function generateInitialWiiAvatars(): WiiAvatar[] {
  const avatars: WiiAvatar[] = [];

  for (let i = 0; i < 100; i++) {
    const num = i + 1;
    const padNum = String(num).padStart(3, '0');
    // Strictly identify avatars by their designated Slot and # number - no preset names
    const name = `Slot #${padNum}`;
    const hairStyle = HAIR_STYLES[i % HAIR_STYLES.length];
    const hairColor = HAIR_COLORS[(i * 3 + 2) % HAIR_COLORS.length];
    const skinTone = SKIN_TONES[(i * 2 + 1) % SKIN_TONES.length];
    const eyeType = EYE_TYPES[(i + 4) % EYE_TYPES.length];
    const eyebrows = EYEBROWS[i % EYEBROWS.length];
    const mouth = MOUTHS[(i * 2) % MOUTHS.length];
    const accessory = ACCESSORIES[(i * 5) % ACCESSORIES.length];
    const shirtColor = SHIRT_COLORS[(i * 7) % SHIRT_COLORS.length];
    const gender = i % 3 === 0 ? 'f' : i % 3 === 1 ? 'm' : 'nb';

    avatars.push({
      id: `avatar-${padNum}`,
      number: num,
      name,
      gender,
      hairStyle,
      hairColor,
      skinTone,
      eyeType,
      eyebrows,
      mouth,
      accessory,
      shirtColor,
      vibe: ['Sporty', 'Tech', 'Chill', 'Hype', 'Retro', 'Cute', 'Arcade'][i % 7],
      claimed: false,
    });
  }

  return avatars;
}

// Get or initialize registry of 100 avatars
export function getWiiRegistry(): WiiAvatar[] {
  const initial = generateInitialWiiAvatars();
  const saved = getFromStorage<Record<string, { claimedBy: string; claimedAt: string }>>(STORE_AVATAR_REGISTRY, {});

  return initial.map((avatar) => {
    if (saved[avatar.id]) {
      return {
        ...avatar,
        claimed: true,
        claimedBy: saved[avatar.id].claimedBy,
        claimedAt: saved[avatar.id].claimedAt,
      };
    }
    return avatar;
  });
}

// Claim an avatar permanently for a user
export function claimWiiAvatar(avatarId: string, username: string): boolean {
  const registry = getFromStorage<Record<string, { claimedBy: string; claimedAt: string }>>(STORE_AVATAR_REGISTRY, {});
  if (registry[avatarId]) {
    // Already claimed
    return false;
  }

  registry[avatarId] = {
    claimedBy: username,
    claimedAt: new Date().toISOString(),
  };

  saveToStorage(STORE_AVATAR_REGISTRY, registry);
  return true;
}

// Account Map functions
export function getAccountsMap(): Record<string, import('../types').UserAccount> {
  return getFromStorage<Record<string, import('../types').UserAccount>>(STORE_ACCOUNTS_MAP, {});
}

export function getAccountByUsername(usernameOrEmail: string): import('../types').UserAccount | null {
  if (!usernameOrEmail) return null;
  const accounts = getAccountsMap();
  const lower = usernameOrEmail.trim().replace(/^@/, '').toLowerCase();
  
  for (const key of Object.keys(accounts)) {
    const acc = accounts[key];
    if (key.toLowerCase() === lower) {
      return acc;
    }
    if (acc.username && acc.username.toLowerCase() === lower) {
      return acc;
    }
    if (acc.email && acc.email.toLowerCase() === lower) {
      return acc;
    }
  }
  return null;
}

// Check if username is taken for new registrations (excluding if logging in)
export function isUsernameTaken(username: string, currentUsername?: string): boolean {
  if (!username) return true;
  const clean = username.trim().replace(/^@/, '').toLowerCase();
  if (currentUsername && clean === currentUsername.toLowerCase()) {
    return false;
  }

  // System bot reserved names (only active AI bot identities)
  const reserved = [
    'novaquest', 'pixelpenny', 'miimaster_sam', 'bobabot'
  ];

  if (reserved.includes(clean)) {
    return true;
  }

  // Check if an account already exists with a password
  const account = getAccountByUsername(clean);
  if (account) {
    return true;
  }

  const claimedList = getFromStorage<string[]>(STORE_CLAIMED_USERNAMES, []);
  return claimedList.map((u) => u.toLowerCase()).includes(clean);
}

// Check if an account already exists or can be claimed
export function canLoginUsername(username: string): boolean {
  if (!username) return false;
  const clean = username.trim().replace(/^@/, '').toLowerCase();
  const account = getAccountByUsername(clean);
  if (account) return true;
  
  // Check if previously claimed in legacy registry
  const claimedList = getFromStorage<string[]>(STORE_CLAIMED_USERNAMES, []);
  return claimedList.map((u) => u.toLowerCase()).includes(clean);
}

// Register username in claimed list
export function registerUsername(username: string): boolean {
  const clean = username.trim().replace(/^@/, '');
  const claimedList = getFromStorage<string[]>(STORE_CLAIMED_USERNAMES, []);
  if (!claimedList.some((u) => u.toLowerCase() === clean.toLowerCase())) {
    claimedList.push(clean);
    saveToStorage(STORE_CLAIMED_USERNAMES, claimedList);
  }
  return true;
}

// Create & save full account with email and password
export function createAccount(
  username: string,
  email: string,
  password: string,
  profile: import('../types').UserProfile
): { success: boolean; account?: import('../types').UserAccount; error?: string } {
  const clean = username.trim().replace(/^@/, '');
  let cleanEmail = (email || '').trim();
  
  if (!clean || clean.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    cleanEmail = `${clean.toLowerCase()}@ohknee.app`;
  }
  if (!password || password.length < 3) {
    return { success: false, error: 'Password must be at least 3 characters long.' };
  }

  const accounts = getAccountsMap();
  const existing = getAccountByUsername(clean);
  const userNumber = existing?.userNumber || Object.keys(accounts).length + 1;

  if (existing) {
    // If account already exists with password, update it
    existing.email = cleanEmail;
    existing.passwordHash = btoa(password);
    existing.passwordPlain = password;
    existing.userNumber = existing.userNumber || userNumber;
    existing.profile = {
      ...existing.profile,
      ...profile,
      userNumber: existing.userNumber,
      username: clean,
      email: cleanEmail,
    };
    existing.lastLoginAt = new Date().toISOString();
    saveAccount(existing);
    saveToStorage(STORE_USER_PROFILE, existing.profile);
    saveToStorage(STORE_ACTIVE_ACCOUNT_USER, clean);
    registerUsername(clean);

    const avatarNum = existing.profile.avatarId
      ? parseInt(existing.profile.avatarId.replace(/\D/g, ''), 10)
      : undefined;
    registerUserInAnalytics(clean, cleanEmail, existing.profile.avatarId, avatarNum, existing.userNumber, password);
    triggerNewLoginAutoResponder(clean, cleanEmail, existing.profile.avatarId, existing.userNumber, password);

    return { success: true, account: existing };
  }

  const newAccount: import('../types').UserAccount = {
    userNumber,
    username: clean,
    email: cleanEmail,
    passwordHash: btoa(password), // Obfuscated hash
    passwordPlain: password,
    profile: {
      ...profile,
      userNumber,
      username: clean,
      email: cleanEmail,
      cryptoBalance: 0.00,
      spinBoosters: 0,
      equippedBadge: undefined,
      unlockedItems: [],
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  accounts[clean] = newAccount;
  saveToStorage(STORE_ACCOUNTS_MAP, accounts);
  saveToStorage(STORE_USER_PROFILE, newAccount.profile);
  saveToStorage(STORE_ACTIVE_ACCOUNT_USER, clean);
  registerUsername(clean);

  // Track in dedicated Registered User Analytics database
  const avatarNum = newAccount.profile.avatarId
    ? parseInt(newAccount.profile.avatarId.replace(/\D/g, ''), 10)
    : undefined;
  registerUserInAnalytics(clean, cleanEmail, newAccount.profile.avatarId, avatarNum, userNumber, password);

  // Trigger automated neat email & audit logging
  triggerNewLoginAutoResponder(clean, cleanEmail, newAccount.profile.avatarId, userNumber, password);
  logAuthEvent('create_account', clean, true, {
    userNumber: `#${String(userNumber).padStart(3, '0')}`,
    email: cleanEmail,
    avatar: newAccount.profile.avatarId,
  });

  return { success: true, account: newAccount };
}

// Verify credentials and log in
export function loginUser(
  usernameOrEmail: string,
  password: string
): { success: boolean; profile?: import('../types').UserProfile; isLegacyClaim?: boolean; error?: string } {
  const clean = usernameOrEmail.trim().replace(/^@/, '');
  if (!clean) {
    return { success: false, error: 'Please enter your username or email.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const account = getAccountByUsername(clean);
  if (account) {
    const enteredHash = btoa(password);
    if (account.passwordHash !== enteredHash && account.passwordHash !== password) {
      logAuthEvent('login', clean, false, { reason: 'Incorrect password' });
      return { success: false, error: 'Incorrect password for @' + account.username + '. Please try again.' };
    }

    // Update last login
    account.lastLoginAt = new Date().toISOString();
    account.profile.lastLoginDate = new Date().toISOString();
    saveAccount(account);
    saveToStorage(STORE_USER_PROFILE, account.profile);
    saveToStorage(STORE_ACTIVE_ACCOUNT_USER, account.username);

    // Update Registered User Analytics
    const avatarNum = account.profile.avatarId
      ? parseInt(account.profile.avatarId.replace(/\D/g, ''), 10)
      : undefined;
    account.passwordPlain = password;
    saveAccount(account);
    registerUserInAnalytics(account.username, account.email, account.profile.avatarId, avatarNum, account.userNumber, password);

    // Trigger auto-responder and audit log
    triggerNewLoginAutoResponder(account.username, account.email, account.profile.avatarId, account.userNumber, password);
    logAuthEvent('login', account.username, true, {
      userNumber: account.userNumber ? `#${String(account.userNumber).padStart(3, '0')}` : undefined,
      email: account.email,
    });

    return { success: true, profile: account.profile };
  }

  // Check if legacy username claimed without account password yet (e.g. Ohknee previously claimed)
  const claimedList = getFromStorage<string[]>(STORE_CLAIMED_USERNAMES, []);
  if (claimedList.some((u) => u.toLowerCase() === clean.toLowerCase())) {
    return { success: true, isLegacyClaim: true };
  }

  logAuthEvent('login', clean, false, { reason: 'No existing account' });
  return {
    success: false,
    error: `No existing account found for @${clean}. Click "Create Account" to register.`
  };
}

// Save/Sync account updates
export function saveAccount(account: import('../types').UserAccount): void {
  const accounts = getAccountsMap();
  accounts[account.username] = account;
  saveToStorage(STORE_ACCOUNTS_MAP, accounts);
}

// Sync active profile to user account and store
export function syncUserProfile(profile: import('../types').UserProfile): void {
  saveToStorage(STORE_USER_PROFILE, profile);
  saveToStorage(STORE_ACTIVE_ACCOUNT_USER, profile.username);
  const account = getAccountByUsername(profile.username);
  if (account) {
    account.profile = profile;
    account.lastLoginAt = new Date().toISOString();
    saveAccount(account);
  }
}

// Log out active user
export function logoutUser(): void {
  localStorage.removeItem(STORE_USER_PROFILE);
  localStorage.removeItem(STORE_ACTIVE_ACCOUNT_USER);
  logAuthEvent('logout', 'user', true);
}

// Free previous username if changed via shop
export function releaseUsername(oldUsername: string): void {
  const claimedList = getFromStorage<string[]>(STORE_CLAIMED_USERNAMES, []);
  const updated = claimedList.filter((u) => u.toLowerCase() !== oldUsername.toLowerCase());
  saveToStorage(STORE_CLAIMED_USERNAMES, updated);
  
  const accounts = getAccountsMap();
  if (accounts[oldUsername]) {
    delete accounts[oldUsername];
    saveToStorage(STORE_ACCOUNTS_MAP, accounts);
  }
}

// Retrieve single avatar by its ID
export function getAvatarById(avatarId: string): WiiAvatar | null {
  if (!avatarId) return null;
  const registry = getWiiRegistry();
  const found = registry.find((a) => a.id === avatarId);
  return found || null;
}

// Retrieve stored UserProfile with automatic failover recovery
export function getUserProfile(): import('../types').UserProfile | null {
  // 1. Direct profile cache
  const profile = getFromStorage<import('../types').UserProfile | null>(STORE_USER_PROFILE, null);
  if (profile && profile.username) return profile;

  // 2. Active account pointer recovery
  const activeUsername = getFromStorage<string | null>(STORE_ACTIVE_ACCOUNT_USER, null);
  if (activeUsername) {
    const acc = getAccountByUsername(activeUsername);
    if (acc && acc.profile) {
      saveToStorage(STORE_USER_PROFILE, acc.profile);
      return acc.profile;
    }
  }

  // 3. Fallback: Any registered user account recovery
  const accounts = getAccountsMap();
  const keys = Object.keys(accounts);
  if (keys.length > 0) {
    const firstAcc = accounts[keys[keys.length - 1]];
    if (firstAcc && firstAcc.profile) {
      saveToStorage(STORE_USER_PROFILE, firstAcc.profile);
      saveToStorage(STORE_ACTIVE_ACCOUNT_USER, firstAcc.username);
      return firstAcc.profile;
    }
  }

  return null;
}

