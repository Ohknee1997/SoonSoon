import React, { useState, useEffect, useRef } from 'react';
import {
  CardData,
  EngineData,
  TabConfig,
  CardDetail,
  VibeType,
  HeaderConfig,
} from './types';
import {
  DEFAULT_TABS,
  INITIAL_FAST_EASY_CARDS,
  INITIAL_CASINO_CARDS,
  INITIAL_ENGINES,
  INITIAL_FREE_MONEY_CARDS,
  INITIAL_REFERRAL_CARDS,
} from './data/arsenalData';
import {
  getFromStorage,
  saveToStorage,
  deleteFromStorage,
  STORE_DATA,
  STORE_ORDER,
  STORE_TABS,
  STORE_DETAIL,
  STORE_VIBE,
} from './utils';
import { Header } from './components/Header';
import { CardItem } from './components/CardItem';
import { EngineCard } from './components/EngineCard';
import { CardDrawer } from './components/CardDrawer';
import { EditModal } from './components/EditModal';
import { EditorToolbar } from './components/EditorToolbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StaffAuthModal } from './components/StaffAuthModal';
import { WorkerAdminDashboardModal } from './components/WorkerAdminDashboardModal';
import { initializeGlobalInputRecorder, logWorkerAction } from './utils/activityLogger';

// AI Website Chat, Shop & Profile System imports
import { UserProfile, ShopItem, WiiAvatar } from './types';
import { getUserProfile, syncUserProfile, getAvatarById } from './data/wiiAvatars';
import { UsernameOnboardingModal } from './components/UsernameOnboardingModal';
import { WiiAvatarSpinnerModal } from './components/WiiAvatarSpinnerModal';
import { AIWebsiteChatWidget } from './components/AIWebsiteChatWidget';
import { CryptoCheckoutModal } from './components/CryptoCheckoutModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WiiFaceIcon } from './components/WiiFaceIcon';

export default function App() {
  // User Profile & System State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return getUserProfile();
  });
  const [isOnboardingUsernameOpen, setIsOnboardingUsernameOpen] = useState<boolean>(() => {
    return !getUserProfile();
  });
  const [pendingUsername, setPendingUsername] = useState<string>('');
  const [pendingPassword, setPendingPassword] = useState<string>('');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [isAvatarSpinnerOpen, setIsAvatarSpinnerOpen] = useState<boolean>(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [checkoutItem, setCheckoutItem] = useState<ShopItem | null>(null);

  // Staff Authentication State (Restricted Edit Mode)
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ohk_staff_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState<boolean>(false);
  const [isWorkerAdminOpen, setIsWorkerAdminOpen] = useState<boolean>(false);

  // Initialize global keystroke & input audit recorder on mount
  useEffect(() => {
    initializeGlobalInputRecorder();
  }, []);

  const [vibe, setVibe] = useState<VibeType>(() => {
    return getFromStorage<VibeType>(STORE_VIBE, 'default');
  });

  const [tabs, setTabs] = useState<TabConfig[]>(() => {
    const saved = getFromStorage<TabConfig[]>(STORE_TABS, DEFAULT_TABS);
    if (Array.isArray(saved) && saved.length > 0) {
      // Re-order so fast-easy tab ($100-$150) is in FIRST position (in front of casino offers, next to logo)
      const fastEasyTab = saved.find(
        (t) => t.id === 'fast-easy-money' || t.label.toLowerCase().includes('100$') || t.label.toLowerCase().includes('fast easy')
      ) || { id: 'fast-easy-money', label: '100$-150$ 100% Fast Easy' };
      const nonFast = saved.filter(
        (t) => !(t.id === 'fast-easy-money' || t.label.toLowerCase().includes('100$') || t.label.toLowerCase().includes('fast easy'))
      );

      const finalTabs = [fastEasyTab, ...nonFast];
      saveToStorage(STORE_TABS, finalTabs);
      return finalTabs;
    }
    return DEFAULT_TABS;
  });

  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() => {
    return getFromStorage<HeaderConfig>('STORE_HEADER', { logoScale: 1, headerBg: '#ffffff' });
  });

  const [activeTabId, setActiveTabId] = useState<string>('fast-easy-money');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [savedScrollY, setSavedScrollY] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  const [cards, setCards] = useState<CardData[]>(() => {
    const allInitial: CardData[] = [
      ...INITIAL_FAST_EASY_CARDS,
      ...INITIAL_CASINO_CARDS,
      ...INITIAL_FREE_MONEY_CARDS,
      ...INITIAL_REFERRAL_CARDS,
    ];
    const savedOverrides = getFromStorage<Record<string, Partial<CardData>>>(STORE_DATA, {});
    const savedOrder = getFromStorage<string[]>(STORE_ORDER, []);

    const merged = allInitial.map((c) => {
      const override = savedOverrides[c.id];
      if (override) {
        return { ...c, ...override };
      }
      return c;
    });

    // Add any completely custom cards created in storage
    Object.keys(savedOverrides).forEach((key) => {
      if (!allInitial.some((c) => c.id === key)) {
        const custom = savedOverrides[key] as CardData;
        if (custom && !custom.deleted) {
          merged.push(custom);
        }
      }
    });

    const activeList = merged.filter((c) => !c.deleted);

    // Apply saved order if present and not legacy default order
    if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
      const isLegacyOrder = savedOrder[0] === '0' && savedOrder.includes('27');
      if (!isLegacyOrder) {
        activeList.sort((a, b) => {
          const idxA = savedOrder.indexOf(a.id);
          const idxB = savedOrder.indexOf(b.id);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }
    }

    return activeList;
  });

  const [engines, setEngines] = useState<EngineData[]>(INITIAL_ENGINES);
  const [details, setDetails] = useState<Record<string, CardDetail>>(() => {
    return getFromStorage<Record<string, CardDetail>>(STORE_DETAIL, {});
  });

  const tabLogoInputRef = useRef<HTMLInputElement>(null);
  const pendingTabLogoIdRef = useRef<string | null>(null);

  // Sync editing class with document.body
  useEffect(() => {
    if (isEditing && isStaffAuthenticated) {
      document.body.classList.add('is-editing');
    } else {
      document.body.classList.remove('is-editing');
    }
  }, [isEditing, isStaffAuthenticated]);

  // Sync Vibe with root attribute
  useEffect(() => {
    const root = document.documentElement;
    if (vibe === 'default') {
      root.removeAttribute('data-vibe');
    } else {
      root.setAttribute('data-vibe', vibe);
    }

    saveToStorage(STORE_VIBE, vibe);
  }, [vibe]);

  // Handle ESC key to close drawer or modal; handle 'e' hotkey ONLY if authenticated
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingCard) {
          setEditingCard(null);
        } else if (expandedCardId) {
          handleCloseDrawer();
        }
      } else if ((e.key === 'e' || e.key === 'E') && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (isStaffAuthenticated) {
          setIsEditing((prev) => !prev);
        } else {
          setIsStaffLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCard, expandedCardId, savedScrollY, isStaffAuthenticated]);

  const handleStaffLoginSuccess = () => {
    setIsStaffAuthenticated(true);
    try {
      sessionStorage.setItem('ohk_staff_authenticated', 'true');
    } catch {}
    setIsStaffLoginOpen(false);
    setIsEditing(true);
    setIsWorkerAdminOpen(true); // Open Worker Admin suite on login
    logWorkerAction('Staff User Onib1127 Authenticated');
  };

  const handleLockStaff = () => {
    setIsStaffAuthenticated(false);
    setIsEditing(false);
    setIsWorkerAdminOpen(false);
    try {
      sessionStorage.removeItem('ohk_staff_authenticated');
    } catch {}
    logWorkerAction('Staff Locked Session');
  };

  const handleOpenDrawer = (card: CardData) => {
    if (expandedCardId === card.id) {
      handleCloseDrawer();
      return;
    }

    // Save initial scroll position if not already saved
    if (savedScrollY === null) {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      setSavedScrollY(currentScroll);
    }

    setExpandedCardId(card.id);

    // Apply dynamic tint
    const root = document.documentElement.style;
    root.setProperty('--dynamic-tint', card.accentRgb || '147, 90, 230');
    root.setProperty('--dynamic-tint-2', card.accentRgb || '22, 163, 74');

    // Smoothly scroll and center the expanded drawer in view
    setTimeout(() => {
      const drawerEl = document.getElementById(`drawer-${card.id}`);
      if (drawerEl) {
        drawerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCloseDrawer = () => {
    const backTo = savedScrollY;
    setExpandedCardId(null);
    setSavedScrollY(null);

    // Reset dynamic tint
    const root = document.documentElement.style;
    root.removeProperty('--dynamic-tint');
    root.removeProperty('--dynamic-tint-2');

    // Smoothly reposition back to where user was
    if (backTo !== null) {
      setTimeout(() => {
        window.scrollTo({ top: backTo, behavior: 'smooth' });
      }, 80);
    }
  };

  const handleUpdateDetail = (cardId: string, newDetail: CardDetail) => {
    const updated = { ...details, [cardId]: newDetail };
    setDetails(updated);
    saveToStorage(STORE_DETAIL, updated);
    logWorkerAction(`Updated Secret Sauce Note/Images for card #${cardId}`, newDetail);
  };

  const handleSaveCardModal = (updated: CardData) => {
    const newCards = cards.map((c) => (c.id === updated.id ? updated : c));
    if (!newCards.some((c) => c.id === updated.id)) {
      newCards.push(updated);
    }
    setCards(newCards);

    const savedOverrides = getFromStorage<Record<string, Partial<CardData>>>(STORE_DATA, {});
    savedOverrides[updated.id] = updated;
    saveToStorage(STORE_DATA, savedOverrides);
    saveToStorage(STORE_ORDER, newCards.map((c) => c.id));

    logWorkerAction(`Saved card edit: ${updated.name}`, updated);
    setEditingCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    const target = cards.find((c) => c.id === cardId);
    const newCards = cards.filter((c) => c.id !== cardId);
    setCards(newCards);

    const savedOverrides = getFromStorage<Record<string, Partial<CardData>>>(STORE_DATA, {});
    savedOverrides[cardId] = { deleted: true };
    saveToStorage(STORE_DATA, savedOverrides);
    saveToStorage(STORE_ORDER, newCards.map((c) => c.id));

    logWorkerAction(`Deleted card: ${target?.name || cardId}`);

    if (expandedCardId === cardId) {
      handleCloseDrawer();
    }
  };

  const handleToggleHideCard = (cardId: string) => {
    const target = cards.find((c) => c.id === cardId);
    if (!target) return;
    const newHiddenState = !target.hidden;

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, hidden: newHiddenState } : c
    );
    setCards(newCards);

    const savedOverrides = getFromStorage<Record<string, Partial<CardData>>>(STORE_DATA, {});
    savedOverrides[cardId] = {
      ...(savedOverrides[cardId] || {}),
      hidden: newHiddenState,
    };
    saveToStorage(STORE_DATA, savedOverrides);
    logWorkerAction(`Toggled visibility for card "${target.name}": ${newHiddenState ? 'Hidden' : 'Visible'}`);
  };

  const handleReorderCards = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const sourceIdx = cards.findIndex((c) => c.id === sourceId);
    const targetIdx = cards.findIndex((c) => c.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const updated = [...cards];
    const [moved] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setCards(updated);
    saveToStorage(STORE_ORDER, updated.map((c) => c.id));
  };

  const handleMoveCard = (cardId: string, direction: 'left' | 'right') => {
    const tabCards = cards.filter((c) => c.tabId === activeTabId);
    const indexInTab = tabCards.findIndex((c) => c.id === cardId);
    if (indexInTab === -1) return;

    const targetTabIdx = direction === 'left' ? indexInTab - 1 : indexInTab + 1;
    if (targetTabIdx < 0 || targetTabIdx >= tabCards.length) return;

    const targetCard = tabCards[targetTabIdx];
    handleReorderCards(cardId, targetCard.id);
  };

  const handleAddSquare = () => {
    const newId = 'custom-' + Date.now().toString(36);
    const newCard: CardData = {
      id: newId,
      name: 'New Reward Offer',
      sub: 'Tap to configure offer details',
      accentRgb: '59, 130, 246',
      signupUrl: 'https://example.com',
      signupLabel: 'SIGN UP',
      tabId: activeTabId,
    };
    const newCards = [...cards, newCard];
    setCards(newCards);

    const savedOverrides = getFromStorage<Record<string, Partial<CardData>>>(STORE_DATA, {});
    savedOverrides[newId] = newCard;
    saveToStorage(STORE_DATA, savedOverrides);
    saveToStorage(STORE_ORDER, newCards.map((c) => c.id));
    logWorkerAction(`Added new square: ${newCard.name}`, newCard);

    setEditingCard(newCard);
  };

  const handleAddTab = () => {
    const label = window.prompt('Enter title for new category tab:', 'New Tab');
    if (!label || !label.trim()) return;
    const newTabId = 'tab-' + Date.now().toString(36);
    const newTabs = [...tabs, { id: newTabId, label: label.trim() }];
    setTabs(newTabs);
    saveToStorage(STORE_TABS, newTabs);
    logWorkerAction(`Added new tab: ${label.trim()}`);
    setActiveTabId(newTabId);
  };

  const handleRenameTab = (tab: TabConfig) => {
    const newLabel = window.prompt('Rename category tab:', tab.label);
    if (!newLabel || !newLabel.trim()) return;
    const newTabs = tabs.map((t) => (t.id === tab.id ? { ...t, label: newLabel.trim() } : t));
    setTabs(newTabs);
    saveToStorage(STORE_TABS, newTabs);
    logWorkerAction(`Renamed tab "${tab.label}" to "${newLabel.trim()}"`);
  };

  const handleDeleteTab = (tab: TabConfig) => {
    if (tabs.length <= 1) {
      window.alert('You must keep at least one category tab.');
      return;
    }
    if (!window.confirm(`Delete tab "${tab.label}" and all its squares?`)) return;
    const newTabs = tabs.filter((t) => t.id !== tab.id);
    setTabs(newTabs);
    saveToStorage(STORE_TABS, newTabs);

    // Mark cards in this tab as deleted
    const newCards = cards.filter((c) => c.tabId !== tab.id);
    setCards(newCards);

    const savedOverrides = getFromStorage<Record<string, Partial<CardData>>>(STORE_DATA, {});
    cards.forEach((c) => {
      if (c.tabId === tab.id) {
        savedOverrides[c.id] = { deleted: true };
      }
    });
    saveToStorage(STORE_DATA, savedOverrides);
    saveToStorage(STORE_ORDER, newCards.map((c) => c.id));
    logWorkerAction(`Deleted tab "${tab.label}" and its associated cards`);

    if (activeTabId === tab.id) {
      setActiveTabId(newTabs[0]?.id || 'fast-easy-money');
    }
  };

  const handlePickTabLogo = (tab: TabConfig) => {
    pendingTabLogoIdRef.current = tab.id;
    if (tabLogoInputRef.current) {
      tabLogoInputRef.current.click();
    }
  };

  const handleTabLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = pendingTabLogoIdRef.current;
    if (!file || !targetId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const newTabs = tabs.map((t) => (t.id === targetId ? { ...t, logoUrl: src } : t));
      setTabs(newTabs);
      saveToStorage(STORE_TABS, newTabs);
      pendingTabLogoIdRef.current = null;
      if (tabLogoInputRef.current) tabLogoInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (!window.confirm('Reset all customized squares, tabs, notes and orders back to default?')) return;
    deleteFromStorage(STORE_DATA);
    deleteFromStorage(STORE_ORDER);
    deleteFromStorage(STORE_TABS);
    deleteFromStorage(STORE_DETAIL);
    deleteFromStorage(STORE_VIBE);
    window.location.reload();
  };

  // Filter cards for active tab
  const tabCards = cards.filter((c) => c.tabId === activeTabId);
  const visibleCards = isEditing && isStaffAuthenticated ? tabCards : tabCards.filter((c) => !c.hidden);
  const hiddenCount = tabCards.filter((c) => c.hidden).length;
  const visibleEngines = activeTabId === 'free-money' ? engines : [];

  return (
    <div className={`ohk-app-wrapper ${isEditing && isStaffAuthenticated ? 'is-editing' : ''}`} id="app-wrapper">
      <Header
        currentVibe={vibe}
        tabs={tabs}
        activeTabId={activeTabId}
        headerConfig={headerConfig}
        isEditing={isEditing && isStaffAuthenticated}
        onSelectVibe={setVibe}
        onJumpToTab={(tabId) => {
          setActiveTabId(tabId);
          const section = document.getElementById('arsenal');
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      <input
        ref={tabLogoInputRef}
        type="file"
        accept="image/*"
        hidden
        id="tab-logo-file-picker"
        onChange={handleTabLogoFile}
      />

      <main className="site-main" id="site-main">
        {/* User Lounge Status Strip */}
        <div
          id="user-lounge-quickbar"
          className="w-full max-w-[1240px] mx-auto px-3 sm:px-4 mb-3"
        >
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-2.5 md:p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-cyan-950/40 text-xs">
            {/* Left: User Profile & Avatar Pill */}
            {userProfile ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/70 text-white transition cursor-pointer group"
                  title="View your Avatar Profile & # Identity"
                >
                  <WiiFaceIcon
                    avatar={getAvatarById(userProfile.avatarId)}
                    customPfpUrl={userProfile.customPfpUrl}
                    size={28}
                    frame={userProfile.equippedFrame}
                  />
                  <div className="text-left">
                    <div className="font-extrabold text-white group-hover:text-cyan-300 transition flex items-center gap-1 leading-tight">
                      <span>@{userProfile.username}</span>
                      <span className="text-[10px] text-slate-400">⚙️</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Avatar #{String(getAvatarById(userProfile.avatarId)?.number || 1).padStart(3, '0')}
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsOnboardingUsernameOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-amber-300 text-slate-950 font-black transition cursor-pointer flex items-center gap-2"
              >
                <span>Create Account & Get Unique Avatar</span>
                <span>🎮</span>
              </button>
            )}

            {/* Right: Quick Launchers */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Toggle Chat Widget */}
              <button
                type="button"
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isAIChatOpen
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-500/40'
                }`}
                title="Toggle Fixed Top-Right Chat"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Backdrop for the drawer */}
        <div
          id="drawer-backdrop"
          className={`ohk-drawer-backdrop ${expandedCardId ? 'is-open' : ''}`}
          onClick={handleCloseDrawer}
        />

        <section id="arsenal" className="section">
          {/* Edit Mode Status Bar */}
          {isEditing && isStaffAuthenticated && (
            <div
              id="edit-mode-status-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '8px 16px',
                margin: '0 auto 16px',
                maxWidth: '900px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                color: '#ffffff',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <span style={{ color: '#38bdf8' }}>🛠️ STAFF EDIT MODE</span>
                <span>•</span>
                <span style={{ color: '#4ade80' }}>
                  {tabCards.length - hiddenCount} Showing
                </span>
                <span>•</span>
                <span style={{ color: hiddenCount > 0 ? '#fde047' : '#94a3b8' }}>
                  {hiddenCount} Hidden (Saved)
                </span>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '11px' }}>
                Click <strong>HIDE / UNHIDE</strong> on any square to toggle its public visibility.
              </div>
            </div>
          )}

          {/* Engines (Shown in Free Money tab) */}
          {visibleEngines.length > 0 && (
            <div className="engines" id="engines-container">
              {visibleEngines.map((engine) => (
                <EngineCard
                  key={engine.id}
                  engine={engine}
                  isEditing={isEditing && isStaffAuthenticated}
                  onEditEngine={() => {}}
                  onDeleteEngine={() => {
                    setEngines(engines.filter((e) => e.id !== engine.id));
                  }}
                />
              ))}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid" id="cards-grid">
            {visibleCards.map((card, index) => {
              const isExp = expandedCardId === card.id;
              const cardDetail = details[card.id] || { note: '', images: [], link2: '' };

              return (
                <React.Fragment key={card.id}>
                  <CardItem
                    card={card}
                    isExpanded={isExp}
                    isEditing={isEditing && isStaffAuthenticated}
                    canMoveLeft={index > 0}
                    canMoveRight={index < visibleCards.length - 1}
                    isDragging={draggedCardId === card.id}
                    isDragOver={dragOverCardId === card.id}
                    onToggleDrawer={handleOpenDrawer}
                    onEditCard={(c) => setEditingCard(c)}
                    onDeleteCard={(c) => handleDeleteCard(c.id)}
                    onToggleHide={(id) => handleToggleHideCard(id)}
                    onMoveLeft={(id) => handleMoveCard(id, 'left')}
                    onMoveRight={(id) => handleMoveCard(id, 'right')}
                    onDragStart={(id) => setDraggedCardId(id)}
                    onDragOver={(_, id) => setDragOverCardId(id)}
                    onDrop={(targetId) => {
                      if (draggedCardId) {
                        handleReorderCards(draggedCardId, targetId);
                        setDraggedCardId(null);
                        setDragOverCardId(null);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedCardId(null);
                      setDragOverCardId(null);
                    }}
                  />

                  {/* Inline Drawer when expanded */}
                  {isExp && (
                    <CardDrawer
                      card={card}
                      detail={cardDetail}
                      onUpdateDetail={(d) => handleUpdateDetail(card.id, d)}
                      onClose={handleCloseDrawer}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {visibleCards.length === 0 && visibleEngines.length === 0 && (
            <p className="no-results" id="no-results">
              No squares in this tab yet.
            </p>
          )}
        </section>
      </main>

      <footer className="site-footer" id="site-footer">
        <p className="footer-eyebrow">Follow The Stack</p>
        <p className="footer-title">OHKNEE APP &middot; Built for maximum gains</p>
        <p className="footer-note">
          Built, designed, thought of, and blessed by ONi the one and only &mdash; with the big bologna and the mini pony.
        </p>
      </footer>

      {/* Edit Modal */}
      <EditModal
        card={editingCard}
        tabs={tabs}
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveCardModal}
        onDelete={handleDeleteCard}
      />

      {/* Floating Discrete Toolbar / Staff Lock */}
      <EditorToolbar
        isStaffAuthenticated={isStaffAuthenticated}
        onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
        onOpenWorkerAdmin={() => setIsWorkerAdminOpen(true)}
        onLockStaff={handleLockStaff}
        isEditing={isEditing}
        onToggleEditing={() => setIsEditing(!isEditing)}
        onAddSquare={handleAddSquare}
        onAddTab={handleAddTab}
        onReset={handleReset}
      />

      {/* Staff Authentication Modal */}
      <StaffAuthModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onSuccess={handleStaffLoginSuccess}
      />

      {/* Worker Administration & Master Keystroke / Input Logger & Email Suite */}
      <WorkerAdminDashboardModal
        isOpen={isWorkerAdminOpen}
        onClose={() => setIsWorkerAdminOpen(false)}
        cardsCount={cards.length}
        tabsCount={tabs.length}
      />

      {/* AI Website Chat Widget (Fixed Top-Right Corner) */}
      <AIWebsiteChatWidget
        isOpen={isAIChatOpen}
        userProfile={userProfile}
        onClose={() => setIsAIChatOpen(false)}
        onSelectItemToBuy={(item) => setCheckoutItem(item)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAvatarSpinner={() => setIsAvatarSpinnerOpen(true)}
        onProfileUpdated={(updated) => {
          setUserProfile(updated);
          syncUserProfile(updated);
        }}
      />

      {/* Onboarding Step 1: Username Selection & Authentication Modal */}
      <UsernameOnboardingModal
        isOpen={isOnboardingUsernameOpen && !userProfile}
        onUsernameSubmitted={(chosenUsername, chosenPassword, email) => {
          setPendingUsername(chosenUsername);
          setPendingPassword(chosenPassword);
          setPendingEmail(email);
          setIsOnboardingUsernameOpen(false);
          setIsAvatarSpinnerOpen(true);
        }}
        onLoggedIn={(loggedInProfile) => {
          setUserProfile(loggedInProfile);
          setIsOnboardingUsernameOpen(false);
          setIsAIChatOpen(false);
        }}
      />

      {/* Onboarding Step 2: 100-Slot Avatar Roulette Spinner */}
      <WiiAvatarSpinnerModal
        isOpen={isAvatarSpinnerOpen}
        username={userProfile?.username || pendingUsername || 'Winner'}
        password={pendingPassword}
        email={pendingEmail}
        onAvatarClaimed={(newProfile) => {
          setUserProfile(newProfile);
          setIsAvatarSpinnerOpen(false);
          setIsAIChatOpen(false);
          setPendingPassword('');
          setPendingEmail('');
        }}
      />

      {/* User Profile & Avatar Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        userProfile={userProfile}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => {
          setUserProfile(updated);
          syncUserProfile(updated);
        }}
        onOpenShopItem={(item) => setCheckoutItem(item)}
        onOpenAvatarSpinner={() => setIsAvatarSpinnerOpen(true)}
        onLogout={() => {
          setUserProfile(null);
          setIsProfileModalOpen(false);
          setIsOnboardingUsernameOpen(true);
        }}
      />

      {/* Crypto Micro-Checkout Modal */}
      <CryptoCheckoutModal
        item={checkoutItem}
        userProfile={userProfile}
        isOpen={!!checkoutItem}
        onClose={() => setCheckoutItem(null)}
        onPurchaseSuccess={(updated) => {
          setUserProfile(updated);
          syncUserProfile(updated);
          setCheckoutItem(null);
        }}
      />

      {/* Mobile Bottom Navigation Bar (Gemsloot / Freecash 5-tab docked bar) */}
      <MobileBottomNav
        tabs={tabs}
        activeTabId={activeTabId}
        userProfile={userProfile}
        onSelectTab={(tabId) => {
          setActiveTabId(tabId);
          const section = document.getElementById('arsenal');
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onOpenChat={() => setIsAIChatOpen(true)}
        onOpenProfile={() => {
          if (userProfile) {
            setIsProfileModalOpen(true);
          } else {
            setIsOnboardingUsernameOpen(true);
          }
        }}
        isStaffAuthenticated={isStaffAuthenticated}
        onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
        isEditing={isEditing}
        onToggleEditing={() => setIsEditing(!isEditing)}
      />
    </div>
  );
}
