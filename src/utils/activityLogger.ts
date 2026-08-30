import { ActivityLogEntry, AutoResponderConfig, EmailLogEntry } from '../types';
import { getFromStorage, saveToStorage } from '../utils';

export const STORE_AUDIT_LOGS = 'ohknee_master_audit_log_v2';
export const STORE_AUTORESPONDER_CONFIG = 'ohknee_autoresponder_config_v1';
export const STORE_EMAIL_LOGS = 'ohknee_autoresponder_logs_v1';

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
export function triggerNewLoginAutoResponder(username: string, email: string, avatarNumber?: number | string): void {
  const config = getAutoResponderConfig();
  if (!config.newLoginEnabled) return;

  const targetEmail = email || 'user@ohknee.app';
  const avatarId = String(avatarNumber || '001').padStart(3, '0');
  const nowStr = new Date().toLocaleString();

  const renderedSubject = config.newLoginSubject
    .replace(/{username}/g, username)
    .replace(/{email}/g, targetEmail)
    .replace(/{avatar}/g, avatarId)
    .replace(/{date}/g, nowStr);

  const renderedBody = config.newLoginBodyTemplate
    .replace(/{username}/g, username)
    .replace(/{email}/g, targetEmail)
    .replace(/{avatar}/g, avatarId)
    .replace(/{date}/g, nowStr);

  const emailLog: EmailLogEntry = {
    id: 'email-' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    type: 'new_login',
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
    fieldId: 'autoresponder_new_login',
    fieldName: `Auto-Responder to @${username} (${targetEmail})`,
    value: `Subject: ${renderedSubject}\nBody:\n${renderedBody}`,
    context: 'New Login Event',
    username,
  });

  // If webhook configured, trigger asynchronously
  if (config.webhookUrl) {
    try {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_login',
          username,
          email: targetEmail,
          subject: renderedSubject,
          body: renderedBody,
          timestamp: new Date().toISOString(),
        }),
      }).catch((e) => console.warn('Autoresponder webhook error:', e));
    } catch {}
  }
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

// Global DOM Listener Setup to continuously capture every single box typed in
let isGlobalListenerAttached = false;

export function initializeGlobalInputRecorder(): void {
  if (typeof window === 'undefined' || isGlobalListenerAttached) return;
  isGlobalListenerAttached = true;

  // Debounced input change recorder
  const timeouts = new Map<HTMLElement, number>();

  document.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!target || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

    // Mask security passkey characters for security if password field
    const isPassword = target.type === 'password';
    const displayVal = isPassword ? '••••••••' : target.value;
    const fieldId = target.id || target.name || target.getAttribute('placeholder') || 'unnamed_field';
    const fieldName = target.getAttribute('aria-label') || target.name || ('placeholder' in target ? (target as HTMLInputElement).placeholder : '') || target.id || 'Input Box';

    // Clear previous timeout for this target to debounce continuous keystrokes
    if (timeouts.has(target)) {
      window.clearTimeout(timeouts.get(target));
    }

    const timer = window.setTimeout(() => {
      logInputTyped(fieldId, fieldName, displayVal, target.closest('form')?.id || 'general_page');
      timeouts.delete(target);
    }, 450);

    timeouts.set(target, timer);
  }, { passive: true });

  // Capture form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (!form) return;
    const formId = form.id || form.name || 'unnamed_form';
    
    // Gather form field data safely
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
