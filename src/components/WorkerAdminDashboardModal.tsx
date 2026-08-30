import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Mail,
  HardDrive,
  Download,
  Trash2,
  CheckCircle2,
  Send,
  AlertCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ActivityLogEntry, AutoResponderConfig, EmailLogEntry } from '../types';
import {
  getRecordedLogs,
  clearRecordedLogs,
  downloadDesktopLogFile,
  getAutoResponderConfig,
  saveAutoResponderConfig,
  getEmailLogs,
  triggerNewLoginAutoResponder,
  triggerSupportAutoResponder,
  logWorkerAction,
} from '../utils/activityLogger';

interface WorkerAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardsCount: number;
  tabsCount: number;
}

export const WorkerAdminDashboardModal: React.FC<WorkerAdminDashboardModalProps> = ({
  isOpen,
  onClose,
  cardsCount,
  tabsCount,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'email' | 'state'>('logs');
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [emailConfig, setEmailConfig] = useState<AutoResponderConfig>(getAutoResponderConfig);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  // Load latest data when opened or when activity is logged
  const refreshData = () => {
    setLogs(getRecordedLogs());
    setEmailLogs(getEmailLogs());
    setEmailConfig(getAutoResponderConfig());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  // Listen for live logged events
  useEffect(() => {
    const handleActivity = () => {
      setLogs(getRecordedLogs());
      setEmailLogs(getEmailLogs());
    };
    window.addEventListener('ohknee:activity_logged', handleActivity);
    return () => {
      window.removeEventListener('ohknee:activity_logged', handleActivity);
    };
  }, []);

  if (!isOpen) return null;

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveAutoResponderConfig(emailConfig);
    setSaveSuccessMsg('Email configuration saved permanently!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleSendTestLoginEmail = () => {
    triggerNewLoginAutoResponder('TesterUser', 'tester@example.com', '042');
    setEmailLogs(getEmailLogs());
    setTestSentMsg('Test new login email dispatched & recorded!');
    setTimeout(() => setTestSentMsg(null), 4000);
  };

  const handleSendTestSupportEmail = () => {
    triggerSupportAutoResponder('SupportClient', emailConfig.supportInboxEmail || 'oniamaya051@gmail.com', 'How do I claim my avatar?');
    setEmailLogs(getEmailLogs());
    setTestSentMsg('Test support auto-response dispatched & recorded!');
    setTimeout(() => setTestSentMsg(null), 4000);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear the audit log stream?')) {
      clearRecordedLogs();
      setLogs([]);
    }
  };

  const handleExportBackup = () => {
    const allData = {
      timestamp: new Date().toISOString(),
      tabs: localStorage.getItem('STORE_TABS'),
      data: localStorage.getItem('STORE_DATA'),
      order: localStorage.getItem('STORE_ORDER'),
      vibe: localStorage.getItem('STORE_VIBE'),
      details: localStorage.getItem('STORE_DETAIL'),
      autoresponder: localStorage.getItem('ohknee_autoresponder_config_v1'),
      accounts: localStorage.getItem('ohknee.accounts.registry.v3'),
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OHKNEE_FULL_SITE_STATE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logWorkerAction('Exported full site state backup JSON');
  };

  const filteredLogs = logs.filter((l) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      l.fieldName.toLowerCase().includes(q) ||
      l.value.toLowerCase().includes(q) ||
      (l.username && l.username.toLowerCase().includes(q)) ||
      l.eventType.toLowerCase().includes(q)
    );
  });

  return (
    <div
      id="worker-admin-modal"
      className="fixed inset-0 z-[12000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Worker Master Control & Audit Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                  AUTH: Onib1127
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous Keystroke & Input Recorder &bull; Email Auto-Responders &bull; Permanent Site State
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 bg-slate-950/60 border-b border-slate-800 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'logs'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={15} />
            <span>Master Input & Keystroke Stream</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              {logs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'email'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail size={15} />
            <span>Email Auto-Responders & Support</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('state')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'state'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive size={15} />
            <span>Permanent State & Desktop Backup</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: AUDIT & KEYSTROKE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Live Keystroke & Input Recorder</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                      RECORDING ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every single input box, search query, login field, and editor change is recorded and preserved.
                  </p>
                </div>

                {/* Download Desktop File CTA Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => downloadDesktopLogFile('txt')}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-950/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Save to Desktop (.txt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadDesktopLogFile('json')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Export JSON format"
                  >
                    <Download size={14} />
                    <span>.JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 cursor-pointer"
                    title="Clear Log History"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Filter / Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter recorded inputs by field name, user, or typed text..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Log Records Stream Table */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 grid grid-cols-12 gap-2">
                  <div className="col-span-3 sm:col-span-2">Time</div>
                  <div className="col-span-3 sm:col-span-2">Event</div>
                  <div className="col-span-3 sm:col-span-3">Target / Field</div>
                  <div className="col-span-3 sm:col-span-5">Recorded Value / Input</div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No logs found matching your filter. Type anything in the site to see it recorded here live!
                    </div>
                  ) : (
                    filteredLogs.map((entry) => (
                      <div key={entry.id} className="p-2.5 hover:bg-slate-900/40 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3 sm:col-span-2 text-slate-400 text-[10px] truncate">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                              entry.eventType === 'input_change'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : entry.eventType === 'auth_event'
                                ? 'bg-amber-500/20 text-amber-300'
                                : entry.eventType === 'worker_edit'
                                ? 'bg-purple-500/20 text-purple-300'
                                : entry.eventType === 'form_submit'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {entry.eventType}
                          </span>
                        </div>
                        <div className="col-span-3 sm:col-span-3 text-slate-300 font-bold truncate" title={entry.fieldName}>
                          {entry.fieldName}
                        </div>
                        <div className="col-span-3 sm:col-span-5 text-amber-200 truncate bg-slate-900/60 px-2 py-1 rounded" title={entry.value}>
                          {entry.value || '<empty>'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL AUTO-RESPONDERS & SUPPORT */}
          {activeTab === 'email' && (
            <form onSubmit={handleSaveEmailConfig} className="space-y-6">
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
              {testSentMsg && (
                <div className="p-3 bg-cyan-950/60 border border-cyan-500/50 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                  <Send size={16} />
                  <span>{testSentMsg}</span>
                </div>
              )}

              {/* Section A: New Login Auto-Responder */}
              <div className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Mail size={16} className="text-amber-400" />
                      <span>New Login / Registration Auto-Responder Email</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Automatically sends an onboarding greeting when any user registers or logs into Ohknee.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.newLoginEnabled}
                      onChange={(e) => setEmailConfig({ ...emailConfig, newLoginEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs font-bold text-slate-300">Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={emailConfig.newLoginSenderName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, newLoginSenderName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Sender Email</label>
                    <input
                      type="email"
                      value={emailConfig.newLoginSenderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, newLoginSenderEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={emailConfig.newLoginSubject}
                    onChange={(e) => setEmailConfig({ ...emailConfig, newLoginSubject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Email Body Template (Supports variables: {'{username}'}, {'{email}'}, {'{avatar}'}, {'{date}'})
                  </label>
                  <textarea
                    rows={4}
                    value={emailConfig.newLoginBodyTemplate}
                    onChange={(e) => setEmailConfig({ ...emailConfig, newLoginBodyTemplate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSendTestLoginEmail}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Send Test Login Email</span>
                  </button>
                </div>
              </div>

              {/* Section B: Support Auto-Responder & Forwarding */}
              <div className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Mail size={16} className="text-cyan-400" />
                      <span>Support Inbox & Auto-Responder Settings</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Destination inbox where support queries are routed and automatic response template.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.supportEnabled}
                      onChange={(e) => setEmailConfig({ ...emailConfig, supportEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs font-bold text-slate-300">Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Support Inbox Destination Email
                    </label>
                    <input
                      type="email"
                      value={emailConfig.supportInboxEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, supportInboxEmail: e.target.value })}
                      placeholder="oniamaya051@gmail.com"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Webhook URL (Optional for Zapier/Discord/SMTP)
                    </label>
                    <input
                      type="url"
                      value={emailConfig.webhookUrl || ''}
                      onChange={(e) => setEmailConfig({ ...emailConfig, webhookUrl: e.target.value })}
                      placeholder="https://hooks.zapier.com/..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Support Auto-Reply Subject</label>
                  <input
                    type="text"
                    value={emailConfig.supportSubject}
                    onChange={(e) => setEmailConfig({ ...emailConfig, supportSubject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Support Auto-Reply Body</label>
                  <textarea
                    rows={3}
                    value={emailConfig.supportBodyTemplate}
                    onChange={(e) => setEmailConfig({ ...emailConfig, supportBodyTemplate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSendTestSupportEmail}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Send Test Support Auto-Reply</span>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Permanent Storage: Saved changes remain active indefinitely</span>
                </p>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/50 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 size={15} />
                  <span>Save Email Configuration</span>
                </button>
              </div>

              {/* Sent Email History */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                  <span>Recent Auto-Responder Email Activity</span>
                  <span className="text-[10px] text-slate-500">({emailLogs.length} triggered)</span>
                </h4>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 text-xs font-mono">
                  {emailLogs.length === 0 ? (
                    <div className="py-4 text-center text-slate-500">No emails triggered yet.</div>
                  ) : (
                    emailLogs.map((log) => (
                      <div key={log.id} className="py-2 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-white font-bold">{log.subject}</div>
                          <div className="text-[11px] text-slate-400">To: {log.recipientEmail} (@{log.recipientUsername})</div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold">
                            {log.status}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: PERMANENT STATE & DESKTOP BACKUP */}
          {activeTab === 'state' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <HardDrive size={16} className="text-amber-400" />
                  <span>Worker Permanent State Guarantee</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every single card edit, tab reordering, custom photo upload, rating change, and vibe selection made in worker mode is automatically committed to persistent local storage and backed up immediately.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <div className="text-xl font-black text-amber-400">{cardsCount}</div>
                    <div className="text-[11px] text-slate-400">Total Cards</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <div className="text-xl font-black text-cyan-400">{tabsCount}</div>
                    <div className="text-[11px] text-slate-400">Active Tabs</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <div className="text-xl font-black text-emerald-400">100%</div>
                    <div className="text-[11px] text-slate-400">Persistence Status</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <div className="text-xl font-black text-purple-400">{logs.length}</div>
                    <div className="text-[11px] text-slate-400">Audit Entries</div>
                  </div>
                </div>
              </div>

              {/* Export Full Site Data Backup */}
              <div className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Full Site State Desktop Backup</h4>
                  <p className="text-xs text-slate-400">
                    Export every card, custom tab, override, and worker configuration into a backup file on your desktop.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download size={15} />
                  <span>Download Site State Backup (.json)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Worker Edit Engine: Permanent Save Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
