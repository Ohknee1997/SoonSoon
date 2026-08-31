import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getFromStorage, saveToStorage } from '../utils';

// Local storage key backup
export const STORE_TRAFFIC_LOCAL = 'ohknee_traffic_metrics_v2';
export const STORE_EVENTS_LOCAL = 'ohknee_traffic_events_v2';
export const STORE_PRESENCE_SESSION = 'ohknee_session_id_v2';
export const STORE_VISITOR_ID = 'ohknee_visitor_id_v2';

export interface TrafficEvent {
  id: string;
  type: 'clip_code' | 'click_link' | 'drawer_open' | 'page_view' | 'tab_switch';
  offerId?: string;
  offerName?: string;
  promoCode?: string;
  payout?: string;
  tabId?: string;
  timestamp: string;
  visitorId: string;
  sessionId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  referrer?: string;
  screenResolution?: string;
  country?: string;
}

export interface OfferStats {
  id: string;
  name: string;
  code?: string;
  payout?: string;
  tabId: string;
  clipsCount: number;
  clicksCount: number;
  drawersCount: number;
  lastClippedAt?: string;
}

export interface GlobalTrafficMetrics {
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalClips: number;
  totalClicks: number;
  totalDrawers: number;
  activeViewers: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  tabViews: Record<string, number>;
  offerClips: Record<string, number>;
  offerClicks: Record<string, number>;
  lastUpdated: string;
}

// Generate unique session and visitor IDs
export function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(STORE_VISITOR_ID);
    if (!vid) {
      vid = 'vid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(STORE_VISITOR_ID, vid);
    }
    return vid;
  } catch {
    return 'vid_' + Math.random().toString(36).substring(2, 10);
  }
}

export function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(STORE_PRESENCE_SESSION);
    if (!sid) {
      sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem(STORE_PRESENCE_SESSION, sid);
    }
    return sid;
  } catch {
    return 'sid_' + Math.random().toString(36).substring(2, 10);
  }
}

export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  const ua = navigator.userAgent || '';
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua) || (width >= 640 && width < 1024)) {
    return 'tablet';
  }
  if (/Mobi|Android|iPhone|iPod/i.test(ua) || width < 640) {
    return 'mobile';
  }
  return 'desktop';
}

function getBrowserName(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Browser';
}

// Default initial state
const DEFAULT_METRICS: GlobalTrafficMetrics = {
  totalPageViews: 0,
  totalUniqueVisitors: 0,
  totalClips: 0,
  totalClicks: 0,
  totalDrawers: 0,
  activeViewers: 1,
  deviceBreakdown: {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  },
  tabViews: {},
  offerClips: {},
  offerClicks: {},
  lastUpdated: new Date().toISOString(),
};

// Retrieve local metrics
export function getLocalMetrics(): GlobalTrafficMetrics {
  return getFromStorage<GlobalTrafficMetrics>(STORE_TRAFFIC_LOCAL, DEFAULT_METRICS);
}

// Retrieve local recent events
export function getLocalEvents(): TrafficEvent[] {
  return getFromStorage<TrafficEvent[]>(STORE_EVENTS_LOCAL, []);
}

// Save event locally
function saveEventLocally(event: TrafficEvent) {
  try {
    const existing = getLocalEvents();
    const updated = [event, ...existing].slice(0, 300);
    saveToStorage(STORE_EVENTS_LOCAL, updated);

    const metrics = getLocalMetrics();
    metrics.lastUpdated = new Date().toISOString();

    if (event.type === 'page_view') {
      metrics.totalPageViews = (metrics.totalPageViews || 0) + 1;
      const device = event.deviceType;
      metrics.deviceBreakdown[device] = (metrics.deviceBreakdown[device] || 0) + 1;
      if (event.tabId) {
        metrics.tabViews[event.tabId] = (metrics.tabViews[event.tabId] || 0) + 1;
      }
    } else if (event.type === 'clip_code') {
      metrics.totalClips = (metrics.totalClips || 0) + 1;
      if (event.offerName) {
        metrics.offerClips[event.offerName] = (metrics.offerClips[event.offerName] || 0) + 1;
      }
    } else if (event.type === 'click_link') {
      metrics.totalClicks = (metrics.totalClicks || 0) + 1;
      if (event.offerName) {
        metrics.offerClicks[event.offerName] = (metrics.offerClicks[event.offerName] || 0) + 1;
      }
    } else if (event.type === 'drawer_open') {
      metrics.totalDrawers = (metrics.totalDrawers || 0) + 1;
    }

    saveToStorage(STORE_TRAFFIC_LOCAL, metrics);
    window.dispatchEvent(new CustomEvent('ohknee:traffic_event', { detail: event }));
  } catch (err) {
    console.error('Error saving local traffic event:', err);
  }
}

// Global metric document path in Firestore
const METRICS_DOC_REF = doc(db, 'traffic_analytics', 'global_metrics');

// Record a raw event to Firestore and local backup
export async function logTrafficEvent(
  type: TrafficEvent['type'],
  data: Partial<Omit<TrafficEvent, 'id' | 'timestamp' | 'visitorId' | 'sessionId' | 'deviceType'>> = {}
) {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const deviceType = getDeviceType();
  const browser = getBrowserName();
  const screenResolution = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080';
  const referrer = typeof document !== 'undefined' ? document.referrer || 'Direct' : 'Direct';

  const event: TrafficEvent = {
    id: 'evt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    type,
    visitorId,
    sessionId,
    deviceType,
    browser,
    referrer,
    screenResolution,
    timestamp: new Date().toISOString(),
    ...data,
  };

  // Always save locally first for instantaneous responsiveness
  saveEventLocally(event);

  // Sync to Firestore
  try {
    // 1. Add to events collection for live activity stream
    const eventsCollection = collection(db, 'traffic_events');
    await addDoc(eventsCollection, {
      ...event,
      serverTime: serverTimestamp(),
    });

    // 2. Increment aggregated metrics document
    const updates: Record<string, any> = {
      lastUpdated: new Date().toISOString(),
    };

    if (type === 'page_view') {
      updates.totalPageViews = increment(1);
      updates[`deviceBreakdown.${deviceType}`] = increment(1);
      if (event.tabId) {
        updates[`tabViews.${event.tabId}`] = increment(1);
      }
    } else if (type === 'clip_code') {
      updates.totalClips = increment(1);
      if (event.offerName) {
        const sanitizedKey = event.offerName.replace(/[./#$\[\]]/g, '_');
        updates[`offerClips.${sanitizedKey}`] = increment(1);
      }
    } else if (type === 'click_link') {
      updates.totalClicks = increment(1);
      if (event.offerName) {
        const sanitizedKey = event.offerName.replace(/[./#$\[\]]/g, '_');
        updates[`offerClicks.${sanitizedKey}`] = increment(1);
      }
    } else if (type === 'drawer_open') {
      updates.totalDrawers = increment(1);
    }

    await setDoc(METRICS_DOC_REF, updates, { merge: true });
  } catch (err) {
    // Graceful fallback to local metrics if offline or Firestore network issue
    console.debug('Firestore sync note (persisted locally):', err);
  }
}

// Track Page View
export function trackPageView(tabId: string = 'fast-easy-money') {
  // Check if unique visitor session flag already set for this session
  const isNewSession = !sessionStorage.getItem('ohk_session_viewed');
  if (isNewSession) {
    try {
      sessionStorage.setItem('ohk_session_viewed', 'true');
    } catch {}
  }

  logTrafficEvent('page_view', { tabId });

  // Update presence
  sendPresenceHeartbeat(tabId);
}

// Track Code Clipped (Promo code copied)
export function trackCodeClipped(card: {
  id: string;
  name: string;
  code?: string;
  payout?: string;
  tabId: string;
}) {
  logTrafficEvent('clip_code', {
    offerId: card.id,
    offerName: card.name,
    promoCode: card.code,
    payout: card.payout,
    tabId: card.tabId,
  });
}

// Track Outbound Link Click
export function trackOfferLinkClick(card: {
  id: string;
  name: string;
  signupUrl?: string;
  tabId?: string;
}) {
  logTrafficEvent('click_link', {
    offerId: card.id,
    offerName: card.name,
    promoCode: card.signupUrl,
    tabId: card.tabId,
  });
}

// Track Drawer Open (Secret Sauce view)
export function trackDrawerOpen(card: {
  id: string;
  name: string;
  tabId?: string;
}) {
  logTrafficEvent('drawer_open', {
    offerId: card.id,
    offerName: card.name,
    tabId: card.tabId,
  });
}

// Real-Time Active Viewer Presence Heartbeat
let presenceInterval: any = null;

export function startPresenceTracking(activeTabId: string = 'fast-easy-money') {
  if (presenceInterval) clearInterval(presenceInterval);

  sendPresenceHeartbeat(activeTabId);
  presenceInterval = setInterval(() => {
    sendPresenceHeartbeat(activeTabId);
  }, 25000); // Heartbeat every 25s

  return () => {
    if (presenceInterval) clearInterval(presenceInterval);
  };
}

export async function sendPresenceHeartbeat(activeTabId: string) {
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const deviceType = getDeviceType();

  try {
    const presenceDocRef = doc(db, 'traffic_presence', sessionId);
    await setDoc(
      presenceDocRef,
      {
        sessionId,
        visitorId,
        deviceType,
        activeTab: activeTabId,
        lastSeen: Date.now(),
        serverTime: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    // Fallback silent
  }
}

// Fetch Real-time active viewers count (last 90 seconds)
export async function getLiveActiveViewers(): Promise<number> {
  try {
    const presenceCol = collection(db, 'traffic_presence');
    const snapshot = await getDocs(presenceCol);
    const now = Date.now();
    const cutoff = now - 90000; // 90 seconds
    let activeCount = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const lastSeen = data.lastSeen || 0;
      if (lastSeen > cutoff) {
        activeCount++;
      }
    });

    return Math.max(1, activeCount);
  } catch {
    return 1;
  }
}

// Fetch Global Metrics from Firestore with local fallback
export async function fetchGlobalMetrics(): Promise<GlobalTrafficMetrics> {
  const local = getLocalMetrics();
  try {
    const snap = await getDoc(METRICS_DOC_REF);
    if (snap.exists()) {
      const remote = snap.data() as any;
      const activeViewers = await getLiveActiveViewers();

      const merged: GlobalTrafficMetrics = {
        totalPageViews: Math.max(remote.totalPageViews || 0, local.totalPageViews || 0),
        totalUniqueVisitors: Math.max(remote.totalUniqueVisitors || 0, Math.round(Math.max(remote.totalPageViews || 0, local.totalPageViews || 0) * 0.72) || 1),
        totalClips: Math.max(remote.totalClips || 0, local.totalClips || 0),
        totalClicks: Math.max(remote.totalClicks || 0, local.totalClicks || 0),
        totalDrawers: Math.max(remote.totalDrawers || 0, local.totalDrawers || 0),
        activeViewers,
        deviceBreakdown: {
          desktop: Math.max(remote.deviceBreakdown?.desktop || 0, local.deviceBreakdown?.desktop || 0),
          mobile: Math.max(remote.deviceBreakdown?.mobile || 0, local.deviceBreakdown?.mobile || 0),
          tablet: Math.max(remote.deviceBreakdown?.tablet || 0, local.deviceBreakdown?.tablet || 0),
        },
        tabViews: { ...local.tabViews, ...(remote.tabViews || {}) },
        offerClips: { ...local.offerClips, ...(remote.offerClips || {}) },
        offerClicks: { ...local.offerClicks, ...(remote.offerClicks || {}) },
        lastUpdated: remote.lastUpdated || new Date().toISOString(),
      };
      return merged;
    }
  } catch (err) {
    console.debug('Using local metrics fallback:', err);
  }

  const activeViewers = await getLiveActiveViewers();
  return {
    ...local,
    activeViewers,
    totalUniqueVisitors: Math.max(1, Math.round((local.totalPageViews || 1) * 0.7)),
  };
}

// Fetch recent traffic events stream
export async function fetchRecentEvents(maxCount: number = 50): Promise<TrafficEvent[]> {
  const localEvents = getLocalEvents();
  try {
    const eventsRef = collection(db, 'traffic_events');
    const q = query(eventsRef, orderBy('serverTime', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);

    const remoteEvents: TrafficEvent[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      remoteEvents.push({
        id: docSnap.id,
        type: data.type,
        offerId: data.offerId,
        offerName: data.offerName,
        promoCode: data.promoCode,
        payout: data.payout,
        tabId: data.tabId,
        timestamp: data.timestamp || new Date().toISOString(),
        visitorId: data.visitorId || 'anon',
        sessionId: data.sessionId || 'anon',
        deviceType: data.deviceType || 'desktop',
        browser: data.browser,
        referrer: data.referrer,
        screenResolution: data.screenResolution,
      });
    });

    if (remoteEvents.length > 0) {
      // Merge unique by ID
      const ids = new Set(remoteEvents.map((e) => e.id));
      const combined = [...remoteEvents];
      for (const loc of localEvents) {
        if (!ids.has(loc.id)) {
          combined.push(loc);
        }
      }
      return combined.slice(0, maxCount);
    }
  } catch (err) {
    console.debug('Using local events stream fallback:', err);
  }

  return localEvents.slice(0, maxCount);
}

// Reset Analytics Metrics (Owner utility)
export async function resetAllTrafficData(): Promise<void> {
  saveToStorage(STORE_TRAFFIC_LOCAL, DEFAULT_METRICS);
  saveToStorage(STORE_EVENTS_LOCAL, []);
  try {
    await setDoc(METRICS_DOC_REF, {
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      totalClips: 0,
      totalClicks: 0,
      totalDrawers: 0,
      deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
      tabViews: {},
      offerClips: {},
      offerClicks: {},
      lastUpdated: new Date().toISOString(),
    });
  } catch {}
  window.dispatchEvent(new CustomEvent('ohknee:traffic_reset'));
}
