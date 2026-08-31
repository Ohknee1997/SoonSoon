import React, { useState, useEffect } from 'react';
import {
  fetchGlobalMetrics,
  fetchRecentEvents,
  resetAllTrafficData,
  GlobalTrafficMetrics,
  TrafficEvent,
} from '../utils/trafficTracker';
import { CardData, TabConfig } from '../types';
import {
  BarChart3,
  Users,
  Copy,
  ExternalLink,
  Eye,
  RefreshCw,
  Download,
  Trash2,
  Lock,
  LogOut,
  X,
  Search,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface OwnerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardData[];
  tabs: TabConfig[];
}

export const OwnerAnalyticsModal: React.FC<OwnerAnalyticsModalProps> = ({
  isOpen,
  onClose,
  cards,
  tabs,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ohknee_owner_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Data State
  const [metrics, setMetrics] = useState<GlobalTrafficMetrics | null>(null);
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'activity' | 'audience' | 'export'>('leaderboard');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<'all' | 'clip_code' | 'click_link' | 'page_view'>('all');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Load Data
  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [fetchedMetrics, fetchedEvents] = await Promise.all([
        fetchGlobalMetrics(),
        fetchRecentEvents(100),
      ]);
      setMetrics(fetchedMetrics);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAnalytics();
      const interval = setInterval(loadAnalytics, 15000); // 15s auto refresh
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    // Owner credentials check
    if (cleanUser.toLowerCase() === 'onib' && cleanPass === 'Onib1127!') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('ohknee_owner_auth', 'true');
      } catch {}
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setAuthError('Invalid username or password. Access restricted to Owner.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('ohknee_owner_auth');
    } catch {}
  };

  // Export handlers
  const handleExportCSV = () => {
    if (!metrics) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Rank,Offer Name,Category,Promo Code,Payout,Clips Count,Clicks Count,Conversion Rate %\n';

    const ranked = getRankedOffers();
    ranked.forEach((item, index) => {
      const row = [
        index + 1,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.tabName}"`,
        `"${item.code || 'None'}"`,
        `"${item.payout || 'N/A'}"`,
        item.clips,
        item.clicks,
        `${item.clipRate}%`,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ohknee_analytics_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      metrics,
      events,
      rankedOffers: getRankedOffers(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ohknee_analytics_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset all analytics counters to 0? This action cannot be undone.')) {
      await resetAllTrafficData();
      loadAnalytics();
      setCopiedNotification('All analytics have been reset.');
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  // Helper to compile offer stats merged with current cards
  const getRankedOffers = () => {
    if (!metrics) return [];

    const offerClipsMap = metrics.offerClips || {};
    const offerClicksMap = metrics.offerClicks || {};

    const list = cards.map((card) => {
      const sanitized = card.name.replace(/[./#$\[\]]/g, '_');
      const clips = offerClipsMap[card.name] || offerClipsMap[sanitized] || 0;
      const clicks = offerClicksMap[card.name] || offerClicksMap[sanitized] || 0;
      const totalInteractions = clips + clicks;
      const clipRate = totalInteractions > 0 ? Math.round((clips / totalInteractions) * 100) : 0;
      const tabObj = tabs.find((t) => t.id === card.tabId);

      return {
        id: card.id,
        name: card.name,
        code: card.code,
        payout: card.payout,
        tabId: card.tabId,
        tabName: tabObj ? tabObj.label : card.tabId,
        clips,
        clicks,
        totalInteractions,
        clipRate,
      };
    });

    // Sort by clips descending, then clicks
    list.sort((a, b) => b.clips - a.clips || b.clicks - a.clicks);

    // Apply category filter
    let filtered = list;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.tabId === categoryFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.code && item.code.toLowerCase().includes(q)) ||
          item.tabName.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  if (!isOpen) return null;

  const totalClips = metrics?.totalClips || 0;
  const totalPageViews = metrics?.totalPageViews || 0;
  const totalUniqueVisitors = metrics?.totalUniqueVisitors || 0;
  const totalClicks = metrics?.totalClicks || 0;
  const activeViewers = metrics?.activeViewers || 1;
  const clipConversionRate = totalPageViews > 0 ? ((totalClips / totalPageViews) * 100).toFixed(1) : '0';

  const maxClipsInLeaderboard = Math.max(1, ...getRankedOffers().map((o) => o.clips));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950 text-slate-100 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">Owner Analytics & Traffic Hub</h2>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                  Onib Secured
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time visitor tracking & promo code clip leaderboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span>{activeViewers} Active Now</span>
                </div>

                <button
                  type="button"
                  onClick={loadAnalytics}
                  disabled={isLoading}
                  title="Refresh stats"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-red-950/50 hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Auth Barrier Screen */}
        {!isAuthenticated ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="mb-1 text-xl font-bold text-white">Owner Credentials Required</h3>
              <p className="mb-6 text-sm text-slate-400">
                Enter your credentials to access live traffic analytics and promo code clip counters.
              </p>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-medium text-slate-300">Username</label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Onib"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {authError && (
                  <div className="rounded-lg bg-red-950/60 p-2.5 text-xs text-red-300 border border-red-800/50">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-sm font-semibold text-slate-950 shadow-lg transition hover:from-amber-400 hover:to-amber-500"
                >
                  Authenticate & View Stats
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-2 gap-3 border-b border-slate-800/80 bg-slate-900/40 p-4 sm:grid-cols-5">
              {/* Page Views */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Page Views</span>
                  <Eye className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-1.5 text-2xl font-black text-white">{totalPageViews.toLocaleString()}</div>
                <div className="mt-0.5 text-[11px] text-sky-400/80 font-medium">Total impressions</div>
              </div>

              {/* Unique Visitors */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Unique Visitors</span>
                  <Users className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-1.5 text-2xl font-black text-white">{totalUniqueVisitors.toLocaleString()}</div>
                <div className="mt-0.5 text-[11px] text-emerald-400/80 font-medium">Distinct browser sessions</div>
              </div>

              {/* Promo Codes Clipped */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
                <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
                  <span>Codes Clipped</span>
                  <Copy className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-1.5 text-2xl font-black text-amber-300">{totalClips.toLocaleString()}</div>
                <div className="mt-0.5 text-[11px] text-amber-400/90 font-medium">Times codes copied</div>
              </div>

              {/* Link Clicks */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Outbound Clicks</span>
                  <ExternalLink className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="mt-1.5 text-2xl font-black text-white">{totalClicks.toLocaleString()}</div>
                <div className="mt-0.5 text-[11px] text-indigo-400/80 font-medium">Sign up links opened</div>
              </div>

              {/* Clip Rate % */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Clip Rate</span>
                  <TrendingUp className="h-4 w-4 text-teal-400" />
                </div>
                <div className="mt-1.5 text-2xl font-black text-white">{clipConversionRate}%</div>
                <div className="mt-0.5 text-[11px] text-teal-400/80 font-medium">Clips per page view</div>
              </div>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'leaderboard'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Clipped Offers Leaderboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'activity'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Live Activity Stream</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audience')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'audience'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Devices & Categories</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'export'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export & Tools</span>
                </button>
              </div>

              {copiedNotification && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{copiedNotification}</span>
                </div>
              )}
            </div>

            {/* Tab 1: Clipped Offers Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div className="flex flex-1 flex-col overflow-hidden p-6">
                {/* Search & Category Filter Bar */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative min-w-[240px] flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search offer or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Filter className="h-3 w-3" /> Category:
                    </span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        categoryFilter === 'all'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      All
                    </button>
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCategoryFilter(t.id)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          categoryFilter === t.id
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaderboard Table / Cards */}
                <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="sticky top-0 border-b border-slate-800 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">Rank</th>
                        <th className="px-4 py-3">Offer Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Promo Code</th>
                        <th className="px-4 py-3 text-center">Clips (Copies)</th>
                        <th className="px-4 py-3 text-center">Link Clicks</th>
                        <th className="px-4 py-3 text-right">Clip Popularity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {getRankedOffers().map((item, index) => {
                        const percentOfTop = Math.round((item.clips / maxClipsInLeaderboard) * 100);
                        const isTopThree = index < 3;

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                  index === 0
                                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                                    : index === 1
                                    ? 'bg-slate-300 text-slate-950'
                                    : index === 2
                                    ? 'bg-amber-700 text-white'
                                    : 'text-slate-400'
                                }`}
                              >
                                #{index + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-white">
                              <div className="flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.payout && (
                                  <span className="rounded bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                                    {item.payout}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{item.tabName}</td>
                            <td className="px-4 py-3">
                              {item.code ? (
                                <code className="rounded bg-slate-800 px-2 py-1 font-mono font-bold text-amber-300">
                                  {item.code}
                                </code>
                              ) : (
                                <span className="text-slate-500 italic">No code needed</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-amber-300">
                              <div className="flex items-center justify-center gap-1">
                                <Copy className="h-3.5 w-3.5 text-amber-400" />
                                <span>{item.clips}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-slate-300">
                              {item.clicks}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                                    style={{ width: `${percentOfTop}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-medium text-slate-400 w-8 text-right">
                                  {percentOfTop}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {getRankedOffers().length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                            No offers match the current search or category filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Live Activity Stream */}
            {activeTab === 'activity' && (
              <div className="flex flex-1 flex-col overflow-hidden p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">Filter Event Types:</span>
                    <button
                      type="button"
                      onClick={() => setEventFilter('all')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        eventFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      All Events
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventFilter('clip_code')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        eventFilter === 'clip_code' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      ✂️ Promo Code Clips Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventFilter('click_link')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        eventFilter === 'click_link' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      🔗 Link Clicks Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventFilter('page_view')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        eventFilter === 'page_view' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      👁️ Page Views
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">Showing last {events.length} events</span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                  {events
                    .filter((e) => (eventFilter === 'all' ? true : e.type === eventFilter))
                    .map((evt) => {
                      const timeStr = new Date(evt.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });
                      const dateStr = new Date(evt.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs text-slate-300 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-3">
                            {evt.type === 'clip_code' ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold">
                                <Copy className="h-4 w-4" />
                              </div>
                            ) : evt.type === 'click_link' ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                                <ExternalLink className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                                <Eye className="h-4 w-4" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">
                                  {evt.type === 'clip_code' && `Clipped Promo Code "${evt.promoCode || 'CODE'}"`}
                                  {evt.type === 'click_link' && `Clicked Sign Up for ${evt.offerName || 'Offer'}`}
                                  {evt.type === 'page_view' && `Viewed Category Tab: ${evt.tabId || 'Main'}`}
                                  {evt.type === 'drawer_open' && `Opened Secret Sauce for ${evt.offerName}`}
                                </span>
                                {evt.offerName && (
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-amber-300 font-semibold">
                                    {evt.offerName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>Device: {evt.deviceType}</span>
                                <span>•</span>
                                <span>Browser: {evt.browser || 'Web'}</span>
                                {evt.referrer && evt.referrer !== 'Direct' && (
                                  <>
                                    <span>•</span>
                                    <span>Ref: {evt.referrer}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-[11px] text-slate-500">
                            <div>{timeStr}</div>
                            <div>{dateStr}</div>
                          </div>
                        </div>
                      );
                    })}

                  {events.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                      No live events recorded yet. Browse the app or click copy buttons to see them appear!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Devices & Audience Breakdown */}
            {activeTab === 'audience' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Device Breakdown */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-amber-400" />
                    <span>Device & Platform Distribution</span>
                  </h3>

                  {(() => {
                    const dev = metrics?.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 };
                    const totalDev = (dev.desktop || 0) + (dev.mobile || 0) + (dev.tablet || 0) || 1;
                    const deskPct = Math.round(((dev.desktop || 0) / totalDev) * 100);
                    const mobPct = Math.round(((dev.mobile || 0) / totalDev) * 100);
                    const tabPct = Math.round(((dev.tablet || 0) / totalDev) * 100);

                    return (
                      <div className="space-y-4">
                        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            style={{ width: `${deskPct}%` }}
                            className="bg-sky-500 transition-all duration-500"
                            title={`Desktop: ${deskPct}%`}
                          />
                          <div
                            style={{ width: `${mobPct}%` }}
                            className="bg-amber-500 transition-all duration-500"
                            title={`Mobile: ${mobPct}%`}
                          />
                          <div
                            style={{ width: `${tabPct}%` }}
                            className="bg-emerald-500 transition-all duration-500"
                            title={`Tablet: ${tabPct}%`}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                            <Monitor className="h-6 w-6 text-sky-400" />
                            <div>
                              <div className="text-xs text-slate-400">Desktop</div>
                              <div className="text-lg font-bold text-white">{deskPct}%</div>
                              <div className="text-[10px] text-slate-500">{dev.desktop || 0} visits</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                            <Smartphone className="h-6 w-6 text-amber-400" />
                            <div>
                              <div className="text-xs text-slate-400">Mobile</div>
                              <div className="text-lg font-bold text-white">{mobPct}%</div>
                              <div className="text-[10px] text-slate-500">{dev.mobile || 0} visits</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                            <Tablet className="h-6 w-6 text-emerald-400" />
                            <div>
                              <div className="text-xs text-slate-400">Tablet</div>
                              <div className="text-lg font-bold text-white">{tabPct}%</div>
                              <div className="text-[10px] text-slate-500">{dev.tablet || 0} visits</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Category Traffic Breakdown */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-amber-400" />
                    <span>Views by Reward Category</span>
                  </h3>

                  <div className="space-y-3">
                    {tabs.map((tab) => {
                      const tabViewsMap = metrics?.tabViews || {};
                      const count = tabViewsMap[tab.id] || 0;
                      const counts = Object.values(tabViewsMap).map((v) => Number(v) || 0);
                      const maxTabViews = Math.max(1, ...counts);
                      const pct = Math.round((count / maxTabViews) * 100);

                      return (
                        <div key={tab.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-200">{tab.label}</span>
                            <span className="font-bold text-amber-300">{count} views</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Export & Maintenance Tools */}
            {activeTab === 'export' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="mb-2 text-sm font-bold text-white">Download Analytics Data</h3>
                  <p className="mb-4 text-xs text-slate-400">
                    Export all recorded visits, promo code clip logs, and ranked performance metrics for spreadsheets or external reporting.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-amber-400 transition"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Leaderboard (CSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Full Raw Data (JSON)</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-5">
                  <h3 className="mb-2 text-sm font-bold text-red-300 flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-400" />
                    <span>Reset Analytics Counters</span>
                  </h3>
                  <p className="mb-4 text-xs text-red-300/80">
                    Caution: This will reset all page impression counts, promo code copy logs, and click trackers back to zero.
                  </p>

                  <button
                    type="button"
                    onClick={handleResetData}
                    className="flex items-center gap-2 rounded-xl border border-red-700/50 bg-red-900/40 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-900/60 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Reset All Analytics to 0</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
