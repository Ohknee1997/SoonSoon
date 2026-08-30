import { CustomTextItem } from '../types';

export const STORE_CUSTOM_TEXTS = 'ohknee_custom_texts_v2';

export const INITIAL_CUSTOM_TEXTS: CustomTextItem[] = [];

export function getCustomTexts(): CustomTextItem[] {
  try {
    const raw = localStorage.getItem(STORE_CUSTOM_TEXTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse custom texts:', e);
  }
  return INITIAL_CUSTOM_TEXTS;
}

export function saveCustomTexts(items: CustomTextItem[]): void {
  try {
    localStorage.setItem(STORE_CUSTOM_TEXTS, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('ohknee:custom-texts-updated', { detail: items }));
  } catch (e) {
    console.error('Failed to save custom texts:', e);
  }
}

export function addCustomText(partial?: Partial<CustomTextItem>): CustomTextItem {
  const all = getCustomTexts();
  const newItem: CustomTextItem = {
    id: 'txt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    text: partial?.text || '✨ Add Your Custom Text Here',
    xPercent: partial?.xPercent ?? 50,
    yPx: partial?.yPx ?? 120,
    fontSize: partial?.fontSize ?? 22,
    color: partial?.color || '#fbbf24', // golden yellow default
    bgColor: partial?.bgColor || 'rgba(15, 23, 42, 0.75)',
    fontWeight: partial?.fontWeight || '800',
    isItalic: partial?.isItalic ?? false,
    isUnderline: partial?.isUnderline ?? false,
    hasShadow: partial?.hasShadow ?? true,
    hasBorder: partial?.hasBorder ?? true,
    borderColor: partial?.borderColor || '#f59e0b',
    rotation: partial?.rotation ?? 0,
    targetTabId: partial?.targetTabId || 'all',
    createdAt: new Date().toISOString(),
  };

  all.push(newItem);
  saveCustomTexts(all);
  return newItem;
}

export function updateCustomText(id: string, updates: Partial<CustomTextItem>): CustomTextItem[] {
  const all = getCustomTexts();
  const next = all.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveCustomTexts(next);
  return next;
}

export function deleteCustomText(id: string): CustomTextItem[] {
  const all = getCustomTexts();
  const next = all.filter((item) => item.id !== id);
  saveCustomTexts(next);
  return next;
}
