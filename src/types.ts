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
  userNumber?: number;
  username: string;
  email: string;
  passwordHash: string;
  passwordPlain?: string;
  profile: UserProfile;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserProfile {
  userNumber?: number;
  username: string;
  email?: string;
  avatarId: string;
  customAvatarUrl?: string;
  customPfpUrl?: string;
  cryptoBalance?: number;
  spinBoosters?: number;
  equippedBadge?: string;
  equippedFrame?: string;
  unlockedItems?: string[];
  createdAt: string;
  lastLoginDate: string;
  streakDays?: number;
  dailyRewardClaimed?: boolean;
  totalMessages?: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  fieldId: string;
  fieldName: string;
  value: string;
  context: string;
  username: string;
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
  type: string;
  recipientEmail: string;
  recipientUsername: string;
  subject: string;
  body: string;
  status: string;
}

export interface CustomTextItem {
  id: string;
  text: string;
  xPercent: number; // 0 to 100 across section or screen
  yPx: number; // top offset in pixels within content area
  fontSize: number; // font size in px
  color: string; // hex or rgb color
  bgColor?: string; // background color / pill styling
  fontWeight?: 'normal' | '600' | '800' | '900';
  isItalic?: boolean;
  isUnderline?: boolean;
  hasShadow?: boolean;
  hasBorder?: boolean;
  borderColor?: string;
  rotation?: number;
  targetTabId?: string; // 'all' or specific tab
  createdAt: string;
}
