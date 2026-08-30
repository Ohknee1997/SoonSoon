export interface HeaderConfig {
  logoScale: number;
  headerBg: string;
}

export type VibeType = 'default' | 'goth' | 'greed';

export interface CardData {
  id: string;
  name: string;
  sub?: string;
  domain?: string;
  logoUrl?: string;
  accentRgb: string; // e.g. "239, 68, 68"
  payout?: string;
  payoutTag?: string;
  tierClass?: string;
  code?: string;
  signupUrl: string;
  signupLabel: string;
  badge?: string;
  customSize?: 's' | 'm' | 'l' | 'xl';
  customColor?: string;
  customImg?: string;
  rating?: number; // 1-5 stars
  tabId: string;
  deleted?: boolean;
  hidden?: boolean;
}

export interface EngineData {
  id: string;
  name: string;
  loopText: string;
  gradA: string;
  gradB: string;
  glow: string;
  badges: Array<{ icon?: string; text: string; title: string }>;
  pillars: Array<{ label: string; imgSrc: string }>;
  signupUrl: string;
  signupLabel: string;
  tabId: string;
}

export interface TabConfig {
  id: string;
  label: string;
  logoUrl?: string;
}

export interface CardDetail {
  note: string;
  images: string[];
  link2: string;
}

export interface WiiAvatar {
  id: string;
  number: number;
  name: string; // Slot #<number>
  gender: 'm' | 'f' | 'nb';
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  eyeType: string;
  eyebrows: string;
  mouth: string;
  accessory: string;
  shirtColor: string;
  vibe: string;
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: string;
}

export type AvatarItem = WiiAvatar;

export interface UserAccount {
  username: string;
  email: string;
  passwordHash: string;
  profile: UserProfile;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserProfile {
  username: string;
  email?: string;
  avatarId: string;
  customAvatarUrl?: string;
  customPfpUrl?: string;
  cryptoBalance: number; // Demo crypto balance
  spinBoosters: number;
  equippedBadge?: string;
  equippedGlow?: string;
  equippedFont?: string;
  equippedBubble?: string;
  equippedSound?: string;
  equippedPet?: string;
  equippedFrame?: string;
  unlockedItems: string[];
  createdAt: string;
  lastLoginDate: string;
  streakDays: number;
  dailyRewardClaimed: boolean;
  totalMessages: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'core' | 'badges' | 'glows' | 'stickers' | 'sounds' | 'seasonal' | 'fonts' | 'bubbles' | 'pets' | 'boosters' | 'frames' | 'emojis';
  price: number;
  cryptoPriceText?: string;
  icon: string;
  description: string;
  previewValue?: string;
  isCore?: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: string;
  name: string;
  handle: string;
  avatar?: string;
  avatarId?: string;
  customAvatarUrl?: string;
  customPfpUrl?: string;
  isAI: boolean;
  color: string;
  badge?: string;
  text: string;
  timestamp: string;
  glow?: string;
  font?: string;
  fontStyle?: string;
  bubbleColor?: string;
  bubbleStyle?: string;
  pet?: string;
  sticker?: string;
  frame?: string;
}

export interface CryptoTransaction {
  id: string;
  itemId: string;
  itemName: string;
  usdAmount: number;
  cryptoAmount: string;
  cryptoCurrency: string;
  txHash: string;
  timestamp: string;
  status: 'confirmed' | 'completed' | 'pending';
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  eventType: 'keystroke' | 'input_change' | 'form_submit' | 'button_click' | 'auth_event' | 'worker_edit' | 'email_trigger' | 'chat_message';
  fieldId: string;
  fieldName: string;
  value: string;
  context?: string;
  username?: string;
}

export interface AutoResponderConfig {
  newLoginEnabled: boolean;
  newLoginSenderName: string;
  newLoginSenderEmail: string;
  newLoginSubject: string;
  newLoginBodyTemplate: string;
  
  supportEnabled: boolean;
  supportInboxEmail: string;
  supportSubject: string;
  supportBodyTemplate: string;
  webhookUrl?: string;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  type: 'new_login' | 'support';
  recipientEmail: string;
  recipientUsername: string;
  subject: string;
  body: string;
  status: 'sent' | 'simulated';
}
