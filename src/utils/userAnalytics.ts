import { getFromStorage, saveToStorage } from '../utils';
import { logActivity } from './activityLogger';

export const STORE_USER_ANALYTICS = 'ohknee_user_analytics_v2';

export interface UserAnalyticsRecord {
  userNumber?: number;
  username: string;
  email: string;
  passwordPlain?: string;
  avatarId?: string;
  avatarNumber?: number;
  registeredAt: string;
  lastActiveAt: string;
  totalTimeSpentSeconds: number;
  totalClicks: number;
  clickedOffers: Record<string, number>;
  actionsCount: number;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  screenResolution: string;
  lastAction?: string;
}

// Get all tracked user analytics
export function getAllUserAnalytics(): Record<string, UserAnalyticsRecord> {
  return getFromStorage<Record<string, UserAnalyticsRecord>>(STORE_USER_ANALYTICS, {});
}

// Get single user record
export function getUserAnalytics(username: string): UserAnalyticsRecord | null {
  if (!username) return null;
  const all = getAllUserAnalytics();
  const lower = username.trim().replace(/^@/, '').toLowerCase();
  for (const key of Object.keys(all)) {
    if (key.toLowerCase() === lower) {
      return all[key];
    }
  }
  return null;
}

// Detect device type
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Register or update user record upon account creation / login
export function registerUserInAnalytics(
  username: string,
  email: string,
  avatarId?: string,
  avatarNumber?: number,
  userNumber?: number,
  passwordPlain?: string
): UserAnalyticsRecord {
  const clean = username.trim().replace(/^@/, '');
  const all = getAllUserAnalytics();
  const existing = getUserAnalytics(clean);

  // Compute neat assigned user number if not provided
  let assignedNumber = userNumber || existing?.userNumber;
  if (!assignedNumber) {
    const existingCount = Object.keys(all).length;
    assignedNumber = existingCount + 1;
  }

  const updated: UserAnalyticsRecord = {
    userNumber: assignedNumber,
    username: clean,
    email: email || (existing?.email ?? `${clean.toLowerCase()}@ohknee.app`),
    passwordPlain: passwordPlain || existing?.passwordPlain,
    avatarId: avatarId || existing?.avatarId,
    avatarNumber: avatarNumber || existing?.avatarNumber,
    registeredAt: existing?.registeredAt || new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    totalTimeSpentSeconds: existing?.totalTimeSpentSeconds || 0,
    totalClicks: existing?.totalClicks || 0,
    clickedOffers: existing?.clickedOffers || {},
    actionsCount: existing?.actionsCount || 0,
    deviceType: getDeviceType(),
    screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080',
    lastAction: 'Logged in / Active',
  };

  all[clean] = updated;
  saveToStorage(STORE_USER_ANALYTICS, all);
  return updated;
}

// Increment active time spent on site for current user
export function addTimeSpent(username: string, seconds: number = 5): void {
  if (!username || username === 'guest') return;
  const clean = username.trim();
  const all = getAllUserAnalytics();
  const existing = getUserAnalytics(clean);

  if (existing) {
    existing.totalTimeSpentSeconds = (existing.totalTimeSpentSeconds || 0) + seconds;
    existing.lastActiveAt = new Date().toISOString();
    all[existing.username] = existing;
    saveToStorage(STORE_USER_ANALYTICS, all);
  } else {
    // Auto-create initial record
    registerUserInAnalytics(clean, 'user@ohknee.app');
  }
}

// Track offer click (e.g. Stake, Gemsloot, Freecash, Kalshi)
export function trackOfferClick(username: string, offerName: string, actionType: 'signup' | 'secret_sauce' | 'drawer'): void {
  const cleanUser = username && username !== 'guest' ? username.trim() : 'Guest User';
  const all = getAllUserAnalytics();
  const existing = getUserAnalytics(cleanUser);

  if (existing) {
    existing.totalClicks = (existing.totalClicks || 0) + 1;
    existing.actionsCount = (existing.actionsCount || 0) + 1;
    existing.clickedOffers[offerName] = (existing.clickedOffers[offerName] || 0) + 1;
    existing.lastActiveAt = new Date().toISOString();
    existing.lastAction = `Clicked ${offerName} (${actionType.replace('_', ' ')})`;
    all[existing.username] = existing;
    saveToStorage(STORE_USER_ANALYTICS, all);
  } else if (cleanUser !== 'Guest User') {
    const newRecord = registerUserInAnalytics(cleanUser, 'user@ohknee.app');
    newRecord.totalClicks = 1;
    newRecord.actionsCount = 1;
    newRecord.clickedOffers[offerName] = 1;
    newRecord.lastAction = `Clicked ${offerName} (${actionType.replace('_', ' ')})`;
    all[cleanUser] = newRecord;
    saveToStorage(STORE_USER_ANALYTICS, all);
  }

  // Also log a clean activity entry
  logActivity({
    eventType: 'button_click',
    fieldId: `offer_${offerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    fieldName: `Offer Interaction: ${offerName}`,
    value: `Action: ${actionType.toUpperCase()} | Target: ${offerName}`,
    context: 'Offers Grid',
    username: cleanUser,
  });
}

// Helper to format seconds to human readable time string (e.g. "14m 32s" or "2h 15m")
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Export user analytics as formatted CSV
export function exportUserAnalyticsCSV(): void {
  const all = getAllUserAnalytics();
  const users = Object.values(all);

  const headers = [
    'User Number',
    'Username',
    'Email',
    'Password',
    'Registered Date',
    'Last Active Date',
    'Time Spent (Sec)',
    'Time Spent (Formatted)',
    'Total Clicks',
    'Offers Clicked Summary',
    'Device Type',
    'Screen Resolution',
    'Last Action',
  ];

  const rows = users.map((u) => {
    const offerSummary = Object.entries(u.clickedOffers || {})
      .map(([name, count]) => `${name} (${count}x)`)
      .join('; ');

    return [
      `"#${String(u.userNumber || 1).padStart(3, '0')}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.passwordPlain || '••••••••'}"`,
      `"${new Date(u.registeredAt).toLocaleString()}"`,
      `"${new Date(u.lastActiveAt).toLocaleString()}"`,
      u.totalTimeSpentSeconds || 0,
      `"${formatDuration(u.totalTimeSpentSeconds || 0)}"`,
      u.totalClicks || 0,
      `"${offerSummary}"`,
      `"${u.deviceType || 'unknown'}"`,
      `"${u.screenResolution || 'unknown'}"`,
      `"${u.lastAction || 'Active'}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OHKNEE_REGISTERED_USERS_STATS_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate neat text format for user registration record
export function formatUserRegistrationNeat(user: {
  userNumber?: number;
  username: string;
  password?: string;
  email: string;
  date?: string | Date;
  avatarNumber?: number | string;
}): string {
  const num = user.userNumber ? `#${String(user.userNumber).padStart(3, '0')}` : '#001';
  const cleanUser = user.username.replace(/^@/, '');
  const cleanPass = user.password || '••••••••';
  const dateFormatted = user.date ? new Date(user.date).toLocaleString() : new Date().toLocaleString();
  const avatarStr = user.avatarNumber ? `Slot #${String(user.avatarNumber).padStart(3, '0')}` : 'Slot #001';

  return [
    '================================================================================',
    '                       OHKNEE USER REGISTRATION RECORD',
    '================================================================================',
    `  Assigned User Number: ${num}`,
    `  Username:             @${cleanUser}`,
    `  Password:             ${cleanPass}`,
    `  Email:                ${user.email}`,
    `  Date & Time:          ${dateFormatted}`,
    `  Avatar ID:            ${avatarStr}`,
    '================================================================================',
  ].join('\n');
}
