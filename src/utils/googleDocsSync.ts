import { getAccessToken } from './googleAuth';
import { generateFullStateGoogleDocFormattedText, MASTER_GOOGLE_DOC_BACKUP_URL } from './activityLogger';

export const TARGET_GOOGLE_DOC_ID = '149wUcuIO_aVBhZMnIPxDYvCDUOlmOc_trgdUTwCGFnU';
export const STORE_DOCS_SYNC_STATE = 'ohknee_google_docs_sync_state_v1';

export interface DocsSyncState {
  lastSyncTimestamp: string | null;
  lastSyncSuccess: boolean;
  lastSyncError: string | null;
  syncCount: number;
  isAutoSyncActive: boolean;
  intervalMinutes: number;
  totalUsersSynced: number;
  totalLogBytes: number;
  lastSyncedTextPreview?: string;
}

export const DEFAULT_SYNC_STATE: DocsSyncState = {
  lastSyncTimestamp: null,
  lastSyncSuccess: false,
  lastSyncError: null,
  syncCount: 0,
  isAutoSyncActive: true,
  intervalMinutes: 5,
  totalUsersSynced: 0,
  totalLogBytes: 0,
};

export function getDocsSyncState(): DocsSyncState {
  try {
    const raw = localStorage.getItem(STORE_DOCS_SYNC_STATE);
    if (raw) return { ...DEFAULT_SYNC_STATE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SYNC_STATE;
}

export function saveDocsSyncState(state: DocsSyncState): void {
  try {
    localStorage.setItem(STORE_DOCS_SYNC_STATE, JSON.stringify(state));
  } catch {}
}

/**
 * Pushes the full deduplicated state into the designated Google Doc,
 * replacing the previous document content cleanly so it grows larger and more accurate
 * without duplicate entries.
 */
export async function syncFullStateToGoogleDoc(
  explicitToken?: string
): Promise<{ success: boolean; error?: string; docTitle?: string; bytesWritten?: number }> {
  const token = explicitToken || getAccessToken();
  if (!token) {
    const state = getDocsSyncState();
    state.lastSyncSuccess = false;
    state.lastSyncError = 'Google Account authorization required to sync with Google Docs.';
    saveDocsSyncState(state);
    return { success: false, error: 'Google Account authorization required.' };
  }

  const payloadText = generateFullStateGoogleDocFormattedText();
  const documentId = TARGET_GOOGLE_DOC_ID;

  try {
    // 1. Fetch current document metadata to inspect content length
    const getRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getRes.ok) {
      const errJson = await getRes.json().catch(() => ({}));
      const msg = errJson?.error?.message || `Google Docs API returned status ${getRes.status}`;
      throw new Error(msg);
    }

    const docData = await getRes.json();
    const docTitle = docData.title || 'OHKNEE Full State Backup';

    // Calculate document length for clean overwrite
    // Google Docs body content has elements with startIndex and endIndex
    let maxEndIndex = 1;
    if (docData.body && Array.isArray(docData.body.content)) {
      for (const elem of docData.body.content) {
        if (elem.endIndex && elem.endIndex > maxEndIndex) {
          maxEndIndex = elem.endIndex;
        }
      }
    }

    // 2. Prepare batch update requests
    // To overwrite cleanly without duplicating old runs:
    // - Delete content from 1 to maxEndIndex - 1 (if content exists)
    // - Insert new accumulated deduplicated full state text at index 1
    const requests: any[] = [];

    if (maxEndIndex > 2) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: maxEndIndex - 1,
          },
        },
      });
    }

    requests.push({
      insertText: {
        location: {
          index: 1,
        },
        text: payloadText,
      },
    });

    // 3. Execute batch update
    const updateRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!updateRes.ok) {
      const errJson = await updateRes.json().catch(() => ({}));
      const msg = errJson?.error?.message || `Failed to update document (${updateRes.status})`;
      throw new Error(msg);
    }

    // 4. Update sync state
    const state = getDocsSyncState();
    state.lastSyncTimestamp = new Date().toISOString();
    state.lastSyncSuccess = true;
    state.lastSyncError = null;
    state.syncCount = (state.syncCount || 0) + 1;
    state.totalLogBytes = payloadText.length;
    state.lastSyncedTextPreview = payloadText.slice(0, 300) + '...';
    saveDocsSyncState(state);

    return {
      success: true,
      docTitle,
      bytesWritten: payloadText.length,
    };
  } catch (err: any) {
    console.error('Google Docs Sync Error:', err);
    const state = getDocsSyncState();
    state.lastSyncSuccess = false;
    state.lastSyncError = err.message || 'Unknown Google Docs sync error';
    saveDocsSyncState(state);
    return { success: false, error: err.message || 'Sync failed' };
  }
}
