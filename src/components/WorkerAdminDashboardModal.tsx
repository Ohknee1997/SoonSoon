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
  Users,
  Clock,
  MousePointerClick,
  ExternalLink,
  Eye,
  LogOut,
  Maximize2,
  Calendar,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Lock,
  Key,
  Cloud,
  CheckCheck,
  ArrowUpRight,
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
  MASTER_GOOGLE_DOC_BACKUP_URL,
  generateFullStateGoogleDocFormattedText,
} from '../utils/activityLogger';
import {
  getAllUserAnalytics,
  exportUserAnalyticsCSV,
  formatDuration,
  formatUserRegistrationNeat,
  UserAnalyticsRecord,
} from '../utils/userAnalytics';
import { getAvatarById } from '../data/wiiAvatars';
import { WiiFaceIcon } from './WiiFaceIcon';
import {
  googleSignIn,
  getAccessToken,
  logoutGoogle,
  initAuth,
} from '../utils/googleAuth';
import {
  syncFullStateToGoogleDoc,
  getDocsSyncState,
  saveDocsSyncState,
  DocsSyncState,
  TARGET_GOOGLE_DOC_ID,
} from '../utils/googleDocsSync';
import { User } from 'firebase/auth';

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
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'email' | 'state'>('users');
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<Record<string, UserAnalyticsRecord>>({});
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserAnalyticsRecord | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [userSearchFilter, setUserSearchFilter] = useState('');
  const [emailConfig, setEmailConfig] = useState<AutoResponderConfig>(getAutoResponderConfig);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stateBackupCopied, setStateBackupCopied] = useState(false);

  // Google Docs Auth & Live Sync State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(getAccessToken);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [docsSyncState, setDocsSyncState] = useState<DocsSyncState>(getDocsSyncState);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [showConfirmOverwriteModal, setShowConfirmOverwriteModal] = useState(false);
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState(300);

  // Load latest data when opened or when activity is logged
  const refreshData = () => {
    setLogs(getRecordedLogs());
    setEmailLogs(getEmailLogs());
    setEmailConfig(getAutoResponderConfig());
    setUserAnalytics(getAllUserAnalytics());
    setDocsSyncState(getDocsSyncState());
    setGoogleToken(getAccessToken());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  // Auth listener
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsub();
  }, []);

  // 5-minute countdown clock and automated sync loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsUntilNextSync((prev) => {
        if (prev <= 1) {
          // Trigger automated 5m sync if active and authenticated
          const token = getAccessToken();
          const state = getDocsSyncState();
          if (token && state.isAutoSyncActive) {
            syncFullStateToGoogleDoc(token).then((res) => {
              setDocsSyncState(getDocsSyncState());
            });
          }
          return 300; // reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for live logged events and update in real-time
  useEffect(() => {
    const handleActivity = () => {
      setLogs(getRecordedLogs());
      setEmailLogs(getEmailLogs());
      setUserAnalytics(getAllUserAnalytics());
    };
    window.addEventListener('ohknee:activity_logged', handleActivity);
    const timer = setInterval(() => {
      setUserAnalytics(getAllUserAnalytics());
    }, 5000);

    return () => {
      window.removeEventListener('ohknee:activity_logged', handleActivity);
      clearInterval(timer);
    };
  }, []);

  const handleGoogleConnect = async () => {
    setIsSigningInGoogle(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSyncFeedback({ success: true, msg: `Connected as ${res.user.email}!` });
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setSyncFeedback({ success: false, msg: err.message || 'Google authentication failed' });
      setTimeout(() => setSyncFeedback(null), 6000);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handlePerformSync = async () => {
    setShowConfirmOverwriteModal(false);
    setIsSyncingNow(true);
    try {
      const token = googleToken || getAccessToken();
      const res = await syncFullStateToGoogleDoc(token || undefined);
      setDocsSyncState(getDocsSyncState());
      if (res.success) {
        setSyncFeedback({
          success: true,
          msg: `Successfully synced & updated Google Doc (${res.bytesWritten} bytes written)!`,
        });
        setSecondsUntilNextSync(300);
      } else {
        setSyncFeedback({
          success: false,
          msg: res.error || 'Failed to update Google Doc',
        });
      }
    } catch (e: any) {
      setSyncFeedback({ success: false, msg: e.message || 'Sync encountered an error' });
    } finally {
      setIsSyncingNow(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  if (!isOpen) return null;

  const handleOpenInNewWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}?staff_view=1`;
    window.open(url, '_blank');
  };

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
      analytics: localStorage.getItem('ohknee_user_analytics_v2'),
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

  const usersList: UserAnalyticsRecord[] = Object.values(userAnalytics);
  const filteredUsers = usersList.filter((u) => {
    if (!userSearchFilter.trim()) return true;
    const q = userSearchFilter.toLowerCase();
    const clickedStr = Object.keys(u.clickedOffers || {}).join(' ').toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      clickedStr.includes(q)
    );
  });

  // Calculate aggregated metrics
  const totalUsersCount = usersList.length;
  const totalClicksAcrossUsers = usersList.reduce((acc: number, u: UserAnalyticsRecord) => acc + (u.totalClicks || 0), 0);
  const totalTimeSeconds = usersList.reduce((acc: number, u: UserAnalyticsRecord) => acc + (u.totalTimeSpentSeconds || 0), 0);

  // Determine top clicked offer
  const offerClickTotals: Record<string, number> = {};
  usersList.forEach((u: UserAnalyticsRecord) => {
    Object.entries(u.clickedOffers || {}).forEach(([offer, count]) => {
      offerClickTotals[offer] = (offerClickTotals[offer] || 0) + (Number(count) || 0);
    });
  });
  const topOfferEntry = Object.entries(offerClickTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div
      id="worker-admin-modal"
      className="fixed inset-0 z-[12000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
    >
      <div
        className="relative w-full max-w-5xl h-[94vh] max-h-[94vh] bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black shadow-inner">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Staff Master Dashboard
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                  AUTH: Onib1127
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Registered Users & Activity &bull; Click Analytics &bull; Auto-Responders &bull; Permanent State
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenInNewWindow}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-amber-500/30"
              title="Open Staff Suite in a new standalone browser window"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Open in New Window</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Close Staff Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 bg-slate-950/80 border-b border-slate-800 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={15} />
            <span>Registered Users & Stats</span>
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
              {usersList.length}
            </span>
          </button>

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
            <span>Activity Stream</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
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
            <span>Permanent State & Backup</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* TAB 1: REGISTERED USERS & STATS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">{totalUsersCount}</div>
                    <div className="text-[11px] text-slate-400">Registered Users</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-amber-400">{formatDuration(totalTimeSeconds)}</div>
                    <div className="text-[11px] text-slate-400">Total User Time</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <MousePointerClick size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-emerald-400">{totalClicksAcrossUsers}</div>
                    <div className="text-[11px] text-slate-400">Total Offer Clicks</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-purple-300 truncate max-w-[120px]">
                      {topOfferEntry ? topOfferEntry[0] : 'None Yet'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Top Offer {topOfferEntry ? `(${topOfferEntry[1]} clicks)` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar & Search */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchFilter}
                    onChange={(e) => setUserSearchFilter(e.target.value)}
                    placeholder="Search by user number (#001), username, email, or offer clicked..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allNeat = filteredUsers.map((u) => formatUserRegistrationNeat({
                        userNumber: u.userNumber,
                        username: u.username,
                        password: u.passwordPlain,
                        email: u.email,
                        date: u.registeredAt,
                        avatarNumber: u.avatarNumber,
                      })).join('\n\n');
                      navigator.clipboard.writeText(allNeat);
                      setCopiedId('all-users');
                      setTimeout(() => setCopiedId(null), 2500);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition"
                    title="Copy neat registration cards for all users"
                  >
                    {copiedId === 'all-users' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedId === 'all-users' ? 'Copied All!' : 'Copy All Neat'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportUserAnalyticsCSV}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={refreshData}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Refresh user statistics"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>

              {/* Registered Users Table */}
              <div className="bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 grid grid-cols-12 gap-2 uppercase tracking-wider">
                  <div className="col-span-4 sm:col-span-3">User & Number</div>
                  <div className="col-span-3 sm:col-span-3">Credentials (Email / Pass)</div>
                  <div className="col-span-2 sm:col-span-2">Time on Site</div>
                  <div className="col-span-3 sm:col-span-4">Clicked Offers & Actions</div>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No registered user accounts found yet. Users will appear here immediately upon registration!
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const avatar = user.avatarId ? getAvatarById(user.avatarId) : null;
                      const offersEntries = Object.entries(user.clickedOffers || {});
                      const userNumStr = `#${String(user.userNumber || 1).padStart(3, '0')}`;

                      return (
                        <div
                          key={user.username}
                          className="p-3 grid grid-cols-12 gap-2 items-center text-xs hover:bg-slate-900/50 transition cursor-pointer"
                          onClick={() => setSelectedUserDetail(user)}
                        >
                          {/* User & Number */}
                          <div className="col-span-4 sm:col-span-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-400/40 flex items-center justify-center shrink-0 overflow-hidden">
                              {avatar ? (
                                <WiiFaceIcon avatar={avatar} size={28} />
                              ) : (
                                <span className="text-amber-400 font-bold text-xs">
                                  {user.username.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate flex items-center gap-1.5">
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30">
                                  {userNumStr}
                                </span>
                                <span>@{user.username}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                {user.deviceType === 'mobile' ? (
                                  <Smartphone size={10} className="text-cyan-400" />
                                ) : (
                                  <Monitor size={10} className="text-emerald-400" />
                                )}
                                <span>{new Date(user.registeredAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Email & Password */}
                          <div className="col-span-3 sm:col-span-3 font-mono text-[11px] text-slate-300 truncate">
                            <div className="text-slate-200 truncate">{user.email || '—'}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Key size={10} className="text-amber-400" />
                              <span>{user.passwordPlain || '••••••••'}</span>
                            </div>
                          </div>

                          {/* Time on Site */}
                          <div className="col-span-2 sm:col-span-2">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-[11px]">
                              {formatDuration(user.totalTimeSpentSeconds || 0)}
                            </span>
                          </div>

                          {/* Clicked Offers & Action summary */}
                          <div className="col-span-3 sm:col-span-4 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {offersEntries.length === 0 ? (
                                <span className="text-[11px] text-slate-500 italic">No clicks yet</span>
                              ) : (
                                offersEntries.slice(0, 2).map(([offer, count]) => (
                                  <span
                                    key={offer}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 font-bold"
                                  >
                                    {offer} ({count}x)
                                  </span>
                                ))
                              )}
                              {offersEntries.length > 2 && (
                                <span className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-bold">
                                  +{offersEntries.length - 2} more
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const neatText = formatUserRegistrationNeat({
                                    userNumber: user.userNumber,
                                    username: user.username,
                                    password: user.passwordPlain,
                                    email: user.email,
                                    date: user.registeredAt,
                                    avatarNumber: user.avatarNumber,
                                  });
                                  navigator.clipboard.writeText(neatText);
                                  setCopiedId(user.username);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200"
                                title="Copy neat registration format"
                              >
                                {copiedId === user.username ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserDetail(user);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                title="View user details"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* User Detail Inspection Modal / Drawer */}
              {selectedUserDetail && (
                <div
                  className="fixed inset-0 z-[13000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                  onClick={() => setSelectedUserDetail(null)}
                >
                  <div
                    className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400/60 rounded-2xl p-5 text-white shadow-2xl space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-400/40 flex items-center justify-center overflow-hidden">
                          {selectedUserDetail.avatarId && getAvatarById(selectedUserDetail.avatarId) ? (
                            <WiiFaceIcon avatar={getAvatarById(selectedUserDetail.avatarId)!} size={36} />
                          ) : (
                            <Users size={20} className="text-amber-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/40">
                              #{String(selectedUserDetail.userNumber || 1).padStart(3, '0')}
                            </span>
                            <span>@{selectedUserDetail.username}</span>
                          </h3>
                          <p className="text-xs text-slate-400">{selectedUserDetail.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUserDetail(null)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Neat Registration Card Box */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>Neat Registration Record</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const neatText = formatUserRegistrationNeat({
                              userNumber: selectedUserDetail.userNumber,
                              username: selectedUserDetail.username,
                              password: selectedUserDetail.passwordPlain,
                              email: selectedUserDetail.email,
                              date: selectedUserDetail.registeredAt,
                              avatarNumber: selectedUserDetail.avatarNumber,
                            });
                            navigator.clipboard.writeText(neatText);
                            setCopiedId('modal-detail');
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          {copiedId === 'modal-detail' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'modal-detail' ? 'Copied!' : 'Copy Neat Record'}</span>
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-300 space-y-1 select-all border border-slate-800">
                        <div className="flex justify-between"><span className="text-slate-400">Assigned Number:</span> <span className="text-amber-400 font-bold">#{String(selectedUserDetail.userNumber || 1).padStart(3, '0')}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Username:</span> <span className="text-white font-bold">@{selectedUserDetail.username}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Password:</span> <span className="text-cyan-300 font-bold">{selectedUserDetail.passwordPlain || '••••••••'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="text-white">{selectedUserDetail.email}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Date & Time:</span> <span className="text-slate-300">{new Date(selectedUserDetail.registeredAt).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Avatar Slot:</span> <span className="text-purple-300 font-bold">Slot #{String(selectedUserDetail.avatarNumber || '001').padStart(3, '0')}</span></div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-amber-400 font-black font-mono text-sm">
                          {formatDuration(selectedUserDetail.totalTimeSpentSeconds || 0)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Time on Page</div>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-emerald-400 font-black font-mono text-sm">
                          {selectedUserDetail.totalClicks || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Total Clicks</div>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-cyan-400 font-bold font-mono text-[11px] capitalize">
                          {selectedUserDetail.deviceType || 'Desktop'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Device</div>
                      </div>
                    </div>

                    {/* Offers Clicked Breakdown */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
                        <span>Offers & Links Clicked by @{selectedUserDetail.username}</span>
                        <span className="text-[10px] text-slate-500">
                          {Object.keys(selectedUserDetail.clickedOffers || {}).length} offers
                        </span>
                      </h4>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {Object.entries(selectedUserDetail.clickedOffers || {}).length === 0 ? (
                          <div className="text-xs text-slate-500 py-2 italic text-center">
                            No offers clicked yet.
                          </div>
                        ) : (
                          Object.entries(selectedUserDetail.clickedOffers || {}).map(([offer, count]) => (
                            <div
                              key={offer}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <span className="font-bold text-slate-200">{offer}</span>
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                                {count} {count === 1 ? 'click' : 'clicks'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="text-[10.5px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Registered: {new Date(selectedUserDetail.registeredAt).toLocaleString()}</span>
                      <span>Last Seen: {new Date(selectedUserDetail.lastActiveAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIT & KEYSTROKE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Live Activity & Event Stream</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                      LOGGING ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    User logins, registration, card clicks, drawer opens, and staff changes recorded in persistent storage.
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
                  placeholder="Filter recorded events by field name, user, or action..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Log Records Stream Table */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 grid grid-cols-12 gap-2 uppercase tracking-wider">
                  <div className="col-span-3 sm:col-span-2">Time</div>
                  <div className="col-span-3 sm:col-span-2">Event</div>
                  <div className="col-span-3 sm:col-span-3">Target / Field</div>
                  <div className="col-span-3 sm:col-span-5">Recorded Value / Action</div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No logs found matching your filter.
                    </div>
                  ) : (
                    filteredLogs.map((entry) => (
                      <div key={entry.id} className="p-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-900/60 transition">
                        <div className="col-span-3 sm:col-span-2 text-slate-400 text-[10px]">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              entry.eventType === 'auth_event'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : entry.eventType === 'worker_edit'
                                ? 'bg-amber-500/20 text-amber-300'
                                : entry.eventType === 'email_trigger'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {entry.eventType.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="col-span-3 sm:col-span-3 text-slate-300 font-bold truncate">
                          {entry.fieldName}
                        </div>
                        <div className="col-span-3 sm:col-span-5 text-slate-200 truncate">
                          {entry.value}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL AUTO-RESPONDER CONFIGURATION */}
          {activeTab === 'email' && (
            <form onSubmit={handleSaveEmailConfig} className="space-y-4">
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
              {testSentMsg && (
                <div className="p-3 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                  <Send size={16} />
                  <span>{testSentMsg}</span>
                </div>
              )}

              {/* New Login Welcome Auto-Responder */}
              <div className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      <span>New Login / Registration Auto-Responder</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sent immediately when a user creates an account or logs in with their Avatar.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.newLoginEnabled}
                      onChange={(e) => setEmailConfig({ ...emailConfig, newLoginEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={emailConfig.newLoginSenderName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, newLoginSenderName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Sender Email
                    </label>
                    <input
                      type="email"
                      value={emailConfig.newLoginSenderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, newLoginSenderEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailConfig.newLoginSubject}
                    onChange={(e) => setEmailConfig({ ...emailConfig, newLoginSubject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Body Template (Supports {'{username}'}, {'{email}'}, {'{avatar}'}, {'{date}'})
                  </label>
                  <textarea
                    rows={4}
                    value={emailConfig.newLoginBodyTemplate}
                    onChange={(e) => setEmailConfig({ ...emailConfig, newLoginBodyTemplate: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSendTestLoginEmail}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Send Test Login Email</span>
                  </button>
                </div>
              </div>

              {/* Support Inquiries Auto-Responder */}
              <div className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Mail size={16} className="text-cyan-400" />
                      <span>Support Chat Inquiries Auto-Responder</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dispatched when users ask for assistance in the support chat widget.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.supportEnabled}
                      onChange={(e) => setEmailConfig({ ...emailConfig, supportEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Support Staff Inbox (Monitored by worker)
                    </label>
                    <input
                      type="email"
                      value={emailConfig.supportInboxEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, supportInboxEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Subject Line Format
                    </label>
                    <input
                      type="text"
                      value={emailConfig.supportSubject}
                      onChange={(e) => setEmailConfig({ ...emailConfig, supportSubject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Body Template (Supports {'{username}'}, {'{ticketId}'}, {'{messageSnippet}'})
                  </label>
                  <textarea
                    rows={4}
                    value={emailConfig.supportBodyTemplate}
                    onChange={(e) => setEmailConfig({ ...emailConfig, supportBodyTemplate: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
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

          {/* TAB 4: PERMANENT STATE & DESKTOP BACKUP */}
          {activeTab === 'state' && (
            <div className="space-y-4">
              {/* Master Google Doc Cloud Desktop Backup & 5-Min Live Sync */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 rounded-xl border-2 border-blue-500/50 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">Master Google Doc 5-Minute Live State Sync</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Live Sync Hub
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Pastes progressive, deduplicated full state directly into your live Google Document every 5 minutes.
                      </p>
                    </div>
                  </div>

                  <a
                    href={MASTER_GOOGLE_DOC_BACKUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 transition"
                  >
                    <span>Open Live Google Doc</span>
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Google Authentication & Auto-Sync Engine */}
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Google Account Status */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div>
                        {googleUser || googleToken ? (
                          <div>
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 size={13} />
                              <span>Google Account Connected: {googleUser?.email || 'Authorized'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Target Doc ID: <span className="font-mono text-cyan-300">{TARGET_GOOGLE_DOC_ID.slice(0, 12)}...</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-bold text-amber-300">Google Docs Connection Ready</div>
                            <div className="text-[11px] text-slate-400">Connect Google to enable live 5-minute auto-paste sync</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Auth & Sync Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!(googleUser || googleToken) ? (
                        <button
                          type="button"
                          onClick={handleGoogleConnect}
                          disabled={isSigningInGoogle}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>{isSigningInGoogle ? 'Connecting...' : 'Sign in with Google'}</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowConfirmOverwriteModal(true)}
                            disabled={isSyncingNow}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                          >
                            <RefreshCw size={13} className={isSyncingNow ? 'animate-spin' : ''} />
                            <span>{isSyncingNow ? 'Syncing...' : 'Sync Now to Google Doc'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              logoutGoogle();
                              setGoogleUser(null);
                              setGoogleToken(null);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                            title="Disconnect Google Account"
                          >
                            <LogOut size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sync Status Banner */}
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-slate-300">
                        Auto-Sync Frequency: <strong className="text-amber-400">Every 5 Minutes</strong>
                      </span>
                      <span className="text-slate-500 font-mono">
                        (Next in {Math.floor(secondsUntilNextSync / 60)}m {String(secondsUntilNextSync % 60).padStart(2, '0')}s)
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {docsSyncState.lastSyncTimestamp ? (
                        <span>
                          Last synced: <strong className="text-white">{new Date(docsSyncState.lastSyncTimestamp).toLocaleTimeString()}</strong> ({docsSyncState.syncCount || 0} total syncs)
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Ready for initial sync</span>
                      )}
                    </div>
                  </div>

                  {/* Deduplication Guarantee Note */}
                  <div className="p-2 bg-blue-950/30 rounded-lg border border-blue-500/20 text-[11px] text-blue-200 flex items-start gap-2">
                    <CheckCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Progressive Zero-Duplicate Guarantee:</strong> The live doc is updated by cleanly refreshing the snapshot with all accumulated historical users, assigned numbers (#001, #002...), ratings, and audit streams — growing larger and more accurate over time without duplicate clutter.
                    </span>
                  </div>

                  {syncFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                        syncFeedback.success
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {syncFeedback.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span>{syncFeedback.msg}</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="text-blue-300 truncate max-w-lg select-all">
                    {MASTER_GOOGLE_DOC_BACKUP_URL}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(MASTER_GOOGLE_DOC_BACKUP_URL);
                      setCopiedId('doc-url');
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedId === 'doc-url' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedId === 'doc-url' ? 'Copied URL!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const text = generateFullStateGoogleDocFormattedText();
                      navigator.clipboard.writeText(text);
                      setStateBackupCopied(true);
                      setTimeout(() => setStateBackupCopied(false), 3000);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition"
                  >
                    {stateBackupCopied ? <Check size={15} className="text-slate-950 font-black" /> : <Copy size={15} />}
                    <span>{stateBackupCopied ? 'Full State Text Copied!' : 'Copy Full State for Google Doc'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = generateFullStateGoogleDocFormattedText();
                      const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `OHKNEE_FULL_STATE_GOOGLE_DOC_BACKUP_${new Date().toISOString().slice(0, 10)}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Formatted .txt</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>

              {/* State Overview Counters */}
              <div className="p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <HardDrive size={16} className="text-amber-400" />
                  <span>Worker Permanent Local Storage Guarantee</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every single card edit, tab reordering, custom photo upload, rating change, and vibe selection made in worker mode is automatically committed to persistent storage and verified in the Google Doc backup stream.
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
                    <div className="text-xl font-black text-emerald-400">{usersList.length}</div>
                    <div className="text-[11px] text-slate-400">Registered Users</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <div className="text-xl font-black text-purple-400">{logs.length}</div>
                    <div className="text-[11px] text-slate-400">Audit Entries</div>
                  </div>
                </div>
              </div>

              {/* Formatted Backup Text Live Preview */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                    <FileText size={14} className="text-amber-400" />
                    <span>Live Google Doc Backup Payload Preview</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Ready to paste into master doc</span>
                </div>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10.5px] font-mono text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap select-all leading-relaxed">
                  {generateFullStateGoogleDocFormattedText()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Staff Session Active &bull; 5m Google Doc Auto-Sync Active</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory User Confirmation Modal for Google Doc Batch Overwrite */}
      {showConfirmOverwriteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Sync & Overwrite Google Doc Preview?</h4>
                <p className="text-xs text-slate-400">Document ID: {TARGET_GOOGLE_DOC_ID.slice(0, 10)}...</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                This operation will refresh the live Google Document body with the <strong>complete progressive deduplicated state</strong>:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Overwrites the previous snapshot so data is <strong>never duplicated</strong>.</li>
                <li>Preserves all historical user records, passwords, and assigned user numbers (#001, #002...).</li>
                <li>Includes latest analytics, clicks, and audit streams.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmOverwriteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePerformSync}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Confirm & Sync to Google Doc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
