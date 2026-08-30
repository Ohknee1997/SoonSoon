import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CardData, CardDetail, CustomTextItem, HeaderConfig, TabConfig, VibeType } from '../types';
import {
  STORE_DATA,
  STORE_DETAIL,
  STORE_ORDER,
  STORE_TABS,
  STORE_VIBE,
  STORE_HEADER,
  saveToStorage,
  getFromStorage,
} from '../utils';
import { STORE_CUSTOM_TEXTS, saveCustomTexts } from './customTextStorage';

export interface CloudMasterState {
  cards?: CardData[];
  cardOverrides?: Record<string, Partial<CardData>>;
  cardOrder?: string[];
  details?: Record<string, CardDetail>;
  customTexts?: CustomTextItem[];
  tabs?: TabConfig[];
  vibe?: VibeType;
  headerConfig?: HeaderConfig;
  lastUpdated?: string;
}

const MASTER_DOC_PATH = 'app_state';
const MASTER_DOC_ID = 'master_state';
const DETAILS_DOC_ID = 'card_details';

let isSyncingToCloud = false;
let isApplyingFromCloud = false;
let lastCloudSaveTime: string | null = null;
let lastCloudSaveSuccess = true;

export function getLastCloudSaveInfo() {
  return {
    time: lastCloudSaveTime,
    success: lastCloudSaveSuccess,
    isSyncing: isSyncingToCloud,
  };
}

/**
 * Uploads all current local storage state (cards, custom texts, notes, photos, tabs, vibes)
 * to Firestore so every device and visitor shares the exact same database.
 */
export async function pushFullStateToCloud(): Promise<{ success: boolean; error?: string }> {
  if (isApplyingFromCloud) return { success: true };
  isSyncingToCloud = true;

  try {
    const cardOverrides = getFromStorage<Record<string, Partial<CardData>>>(STORE_DATA, {});
    const cardOrder = getFromStorage<string[]>(STORE_ORDER, []);
    const details = getFromStorage<Record<string, CardDetail>>(STORE_DETAIL, {});
    const customTexts = getFromStorage<CustomTextItem[]>(STORE_CUSTOM_TEXTS, []);
    const tabs = getFromStorage<TabConfig[]>(STORE_TABS, []);
    const vibe = getFromStorage<VibeType>(STORE_VIBE, 'default');
    const headerConfig = getFromStorage<HeaderConfig>(STORE_HEADER, { logoScale: 1, headerBg: '#ffffff' });

    const now = new Date().toISOString();

    const masterPayload: CloudMasterState = {
      cardOverrides,
      cardOrder,
      customTexts,
      tabs,
      vibe,
      headerConfig,
      lastUpdated: now,
    };

    // Save master layout & custom text layer
    const masterDocRef = doc(db, MASTER_DOC_PATH, MASTER_DOC_ID);
    await setDoc(masterDocRef, masterPayload, { merge: true });

    // Save card details & uploaded secret sauce notes/images separately for high capacity
    const detailsDocRef = doc(db, MASTER_DOC_PATH, DETAILS_DOC_ID);
    await setDoc(detailsDocRef, { details, lastUpdated: now }, { merge: true });

    lastCloudSaveTime = now;
    lastCloudSaveSuccess = true;
    isSyncingToCloud = false;

    window.dispatchEvent(
      new CustomEvent('ohknee:cloud-save-status', {
        detail: { time: now, success: true },
      })
    );

    return { success: true };
  } catch (err: any) {
    console.error('Failed to push state to Firestore:', err);
    isSyncingToCloud = false;
    lastCloudSaveSuccess = false;

    window.dispatchEvent(
      new CustomEvent('ohknee:cloud-save-status', {
        detail: { time: new Date().toISOString(), success: false, error: err.message },
      })
    );

    return { success: false, error: err.message };
  }
}

/**
 * Pulls master state from Firestore and hydrates localStorage & active state.
 */
export async function pullFullStateFromCloud(): Promise<{
  success: boolean;
  data?: {
    master: CloudMasterState | null;
    details: Record<string, CardDetail> | null;
  };
  error?: string;
}> {
  try {
    const masterDocRef = doc(db, MASTER_DOC_PATH, MASTER_DOC_ID);
    const detailsDocRef = doc(db, MASTER_DOC_PATH, DETAILS_DOC_ID);

    const [masterSnap, detailsSnap] = await Promise.all([
      getDoc(masterDocRef),
      getDoc(detailsDocRef),
    ]);

    const masterData = masterSnap.exists() ? (masterSnap.data() as CloudMasterState) : null;
    const detailsData = detailsSnap.exists() ? (detailsSnap.data()?.details as Record<string, CardDetail>) : null;

    if (masterData) {
      applyCloudStateToLocal(masterData, detailsData || undefined);
    }

    return {
      success: true,
      data: {
        master: masterData,
        details: detailsData,
      },
    };
  } catch (err: any) {
    console.error('Failed to pull state from Firestore:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Applies fetched Firestore state to localStorage and fires UI update events.
 */
export function applyCloudStateToLocal(
  masterData: CloudMasterState,
  detailsData?: Record<string, CardDetail>
) {
  isApplyingFromCloud = true;

  try {
    if (masterData.cardOverrides) {
      saveToStorage(STORE_DATA, masterData.cardOverrides);
    }
    if (masterData.cardOrder && Array.isArray(masterData.cardOrder)) {
      saveToStorage(STORE_ORDER, masterData.cardOrder);
    }
    if (masterData.tabs && Array.isArray(masterData.tabs) && masterData.tabs.length > 0) {
      saveToStorage(STORE_TABS, masterData.tabs);
    }
    if (masterData.vibe) {
      saveToStorage(STORE_VIBE, masterData.vibe);
    }
    if (masterData.headerConfig) {
      saveToStorage(STORE_HEADER, masterData.headerConfig);
    }
    if (masterData.customTexts && Array.isArray(masterData.customTexts)) {
      saveCustomTexts(masterData.customTexts);
    }
    if (detailsData) {
      saveToStorage(STORE_DETAIL, detailsData);
    }

    window.dispatchEvent(
      new CustomEvent('ohknee:cloud-state-synced', {
        detail: { master: masterData, details: detailsData },
      })
    );
  } finally {
    setTimeout(() => {
      isApplyingFromCloud = false;
    }, 500);
  }
}

/**
 * Sets up a live real-time listener and a 5-minute automated background sync interval.
 */
export function initLiveCloudSync(
  onStateReceived?: (master: CloudMasterState, details?: Record<string, CardDetail>) => void
): () => void {
  // 1. Initial pull
  pullFullStateFromCloud().then((res) => {
    if (res.success && res.data?.master && onStateReceived) {
      onStateReceived(res.data.master, res.data.details || undefined);
    }
  });

  // 2. Real-time Snapshot Listener
  const masterDocRef = doc(db, MASTER_DOC_PATH, MASTER_DOC_ID);
  const detailsDocRef = doc(db, MASTER_DOC_PATH, DETAILS_DOC_ID);

  let cachedDetails: Record<string, CardDetail> | undefined;

  const unsubDetails = onSnapshot(
    detailsDocRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data()?.details as Record<string, CardDetail>;
        cachedDetails = d;
        if (d && !isSyncingToCloud) {
          saveToStorage(STORE_DETAIL, d);
          window.dispatchEvent(
            new CustomEvent('ohknee:details-synced', { detail: d })
          );
        }
      }
    },
    (err) => {
      console.warn('Firestore details listener notice:', err);
    }
  );

  const unsubMaster = onSnapshot(
    masterDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as CloudMasterState;
        if (!isSyncingToCloud) {
          applyCloudStateToLocal(data, cachedDetails);
          if (onStateReceived) {
            onStateReceived(data, cachedDetails);
          }
        }
      }
    },
    (err) => {
      console.warn('Firestore master listener notice:', err);
    }
  );

  // 3. Strict 5-Minute Auto-Save Loop (every 300,000 ms)
  const intervalId = setInterval(() => {
    pushFullStateToCloud().catch((e) => console.warn('Periodic 5m cloud sync:', e));
  }, 5 * 60 * 1000);

  return () => {
    unsubMaster();
    unsubDetails();
    clearInterval(intervalId);
  };
}
