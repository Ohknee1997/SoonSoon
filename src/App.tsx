import React, { useState, useEffect } from 'react';
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
  STORE_DETAIL,
} from './utils';
import { trackPageView, startPresenceTracking } from './utils/trafficTracker';
import { Header } from './components/Header';
import { CardItem } from './components/CardItem';
import { EngineCard } from './components/EngineCard';
import { CardDrawer } from './components/CardDrawer';
import { OwnerAnalyticsModal } from './components/OwnerAnalyticsModal';

export default function App() {
  const [tabs] = useState<TabConfig[]>(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('fast-easy-money');
  const [vibe, setVibe] = useState<VibeType>('default');
  const [isOwnerAnalyticsOpen, setIsOwnerAnalyticsOpen] = useState(false);

  const [headerConfig] = useState<HeaderConfig>({
    logoScale: 1,
    headerBg: '#ffffff',
  });

  // Master card repository (Loads all verified live cards)
  const [cards] = useState<CardData[]>([
    ...INITIAL_FAST_EASY_CARDS,
    ...INITIAL_CASINO_CARDS,
    ...INITIAL_FREE_MONEY_CARDS,
    ...INITIAL_REFERRAL_CARDS,
  ]);

  const [engines] = useState<EngineData[]>(INITIAL_ENGINES);
  const [details] = useState<Record<string, CardDetail>>(() => {
    return getFromStorage(STORE_DETAIL, {});
  });

  // Drawer expansion
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Set html data-vibe attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-vibe', vibe);
  }, [vibe]);

  // Track page views and active presence
  useEffect(() => {
    trackPageView(activeTabId);
    const stopPresence = startPresenceTracking(activeTabId);
    return () => {
      stopPresence();
    };
  }, [activeTabId]);

  // Drawer handlers
  const handleToggleDrawer = (card: CardData) => {
    if (card.tabId === 'fast-easy-money' || card.hideSecretSauce) {
      return;
    }
    if (expandedCardId === card.id) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(card.id);
    }
  };

  const handleCloseDrawer = () => {
    setExpandedCardId(null);
  };

  const tabCards = cards.filter((c) => c.tabId === activeTabId);
  const displayedCards = tabCards.filter((c) => !c.hidden);
  const visibleEngines = activeTabId === 'free-money' ? engines : [];

  return (
    <div className="ohk-app-wrapper" id="app-wrapper">
      <Header
        currentVibe={vibe}
        tabs={tabs}
        activeTabId={activeTabId}
        headerConfig={headerConfig}
        isEditing={false}
        onSelectVibe={setVibe}
        onJumpToTab={(tabId) => {
          setActiveTabId(tabId);
          const section = document.getElementById('arsenal');
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      <main className="site-main" id="site-main">
        {/* Backdrop for the drawer */}
        <div
          id="drawer-backdrop"
          className={`ohk-drawer-backdrop ${expandedCardId ? 'is-open' : ''}`}
          onClick={handleCloseDrawer}
        />

        <section id="arsenal" className="section relative">
          {/* Engines (Shown in Free Money tab if present) */}
          {visibleEngines.length > 0 && (
            <div className="engines" id="engines-container">
              {visibleEngines.map((engine) => (
                <EngineCard
                  key={engine.id}
                  engine={engine}
                  isEditing={false}
                  onEditEngine={() => {}}
                  onDeleteEngine={() => {}}
                />
              ))}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid" id="cards-grid">
            {displayedCards.map((card) => {
              const isExp = expandedCardId === card.id;
              const cardDetail = details[card.id] || { note: '', images: [], link2: '' };

              return (
                <React.Fragment key={card.id}>
                  <CardItem
                    card={card}
                    isExpanded={isExp}
                    isEditing={false}
                    onToggleDrawer={() => handleToggleDrawer(card)}
                  />

                  {/* Inline Secret Sauce Drawer */}
                  {isExp && (
                    <CardDrawer
                      card={card}
                      detail={cardDetail}
                      onUpdateDetail={() => {}}
                      onClose={handleCloseDrawer}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Empty tab state */}
          {displayedCards.length === 0 && (
            <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-md">
              <p className="text-base font-semibold text-slate-300">No apps currently visible in this tab</p>
            </div>
          )}
        </section>
      </main>

      {/* Small Desktop-Only Owner Analytics Button at the Bottom */}
      <div className="fixed bottom-3 right-4 z-40 hidden md:flex items-center">
        <button
          type="button"
          id="owner-analytics-btn"
          onClick={() => setIsOwnerAnalyticsOpen(true)}
          className="group flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-amber-400/60 hover:bg-slate-900 hover:text-amber-300 hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
          title="Owner Analytics & Traffic Leaderboard"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span>Analytics</span>
        </button>
      </div>

      {/* Owner Analytics & Traffic Leaderboard Modal */}
      <OwnerAnalyticsModal
        isOpen={isOwnerAnalyticsOpen}
        onClose={() => setIsOwnerAnalyticsOpen(false)}
        cards={cards}
        tabs={tabs}
      />
    </div>
  );
}
