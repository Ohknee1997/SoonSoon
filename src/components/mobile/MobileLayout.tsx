import React, { useState, useEffect } from 'react';
import { CardData, EngineData, TabConfig, CardDetail, UserProfile } from '../../types';
import { MobileDesignOption, MobileThemeSwitcher } from './MobileThemeSwitcher';
import { CleanContemporaryView } from './CleanContemporaryView';
import { GamifiedPunchyView } from './GamifiedPunchyView';
import { MinimalFintechView } from './MinimalFintechView';
import { MobilePromptInfoModal } from './MobilePromptInfoModal';
import { CardDrawer } from '../CardDrawer';

interface MobileLayoutProps {
  cards: CardData[];
  tabs: TabConfig[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  engines: EngineData[];
  details: Record<string, CardDetail>;
  onUpdateDetail: (cardId: string, detail: CardDetail) => void;
  onEditCard: (card: CardData) => void;
  onDeleteCard: (card: CardData) => void;
  onToggleHide: (cardId: string) => void;
  isEditing: boolean;
  isStaffAuthenticated: boolean;
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenOnboarding: () => void;
  onOpenStaffLogin: () => void;
  onOpenAdminDashboard: () => void;
}

const STORAGE_KEY = 'gymloot_mobile_theme_choice_v1';

export const MobileLayout: React.FC<MobileLayoutProps> = (props) => {
  const [selectedOption, setSelectedOption] = useState<MobileDesignOption>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'contemporary' || saved === 'gamified' || saved === 'fintech') {
        return saved;
      }
    } catch {}
    return 'contemporary';
  });

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [drawerCardId, setDrawerCardId] = useState<string | null>(null);

  const handleSelectOption = (opt: MobileDesignOption) => {
    setSelectedOption(opt);
    try {
      localStorage.setItem(STORAGE_KEY, opt);
    } catch {}
  };

  const handleToggleDrawer = (card: CardData) => {
    setDrawerCardId((prev) => (prev === card.id ? null : card.id));
  };

  const drawerCard = drawerCardId ? props.cards.find((c) => c.id === drawerCardId) : null;
  const drawerDetail = drawerCardId ? props.details[drawerCardId] || { note: '', images: [], link2: '' } : null;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      {/* 3-Option Interactive Switcher Bar at the top of mobile */}
      <MobileThemeSwitcher
        currentOption={selectedOption}
        onSelectOption={handleSelectOption}
        onOpenInfo={() => setIsInfoModalOpen(true)}
      />

      {/* Render the Active Redesign Option */}
      <div className="flex-1 w-full">
        {selectedOption === 'contemporary' && (
          <CleanContemporaryView
            cards={props.cards}
            tabs={props.tabs}
            activeTabId={props.activeTabId}
            onSelectTab={props.onSelectTab}
            engines={props.engines}
            details={props.details}
            onToggleDrawer={handleToggleDrawer}
            onEditCard={props.onEditCard}
            isEditing={props.isEditing && props.isStaffAuthenticated}
            userProfile={props.userProfile}
            onOpenProfile={props.onOpenProfile}
            onOpenOnboarding={props.onOpenOnboarding}
          />
        )}

        {selectedOption === 'gamified' && (
          <GamifiedPunchyView
            cards={props.cards}
            tabs={props.tabs}
            activeTabId={props.activeTabId}
            onSelectTab={props.onSelectTab}
            engines={props.engines}
            details={props.details}
            onToggleDrawer={handleToggleDrawer}
            onEditCard={props.onEditCard}
            isEditing={props.isEditing && props.isStaffAuthenticated}
            userProfile={props.userProfile}
            onOpenProfile={props.onOpenProfile}
            onOpenOnboarding={props.onOpenOnboarding}
          />
        )}

        {selectedOption === 'fintech' && (
          <MinimalFintechView
            cards={props.cards}
            tabs={props.tabs}
            activeTabId={props.activeTabId}
            onSelectTab={props.onSelectTab}
            engines={props.engines}
            details={props.details}
            onToggleDrawer={handleToggleDrawer}
            onEditCard={props.onEditCard}
            isEditing={props.isEditing && props.isStaffAuthenticated}
            userProfile={props.userProfile}
            onOpenProfile={props.onOpenProfile}
            onOpenOnboarding={props.onOpenOnboarding}
          />
        )}
      </div>

      {/* Mobile Drawer / Secret Sauce Modal */}
      {drawerCard && drawerDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-h-[85vh] bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <CardDrawer
              card={drawerCard}
              detail={drawerDetail}
              onUpdateDetail={(newDetail) => props.onUpdateDetail(drawerCard.id, newDetail)}
              onClose={() => setDrawerCardId(null)}
            />
          </div>
        </div>
      )}

      {/* Mobile Prompt Info Modal */}
      <MobilePromptInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        currentOption={selectedOption}
        onSelectOption={handleSelectOption}
      />
    </div>
  );
};
