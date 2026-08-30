import React, { useState } from 'react';
import { HeaderConfig, TabConfig, VibeType } from '../types';
import { OhkneeLogo } from './OhkneeLogo';
import { DontPushAudioModal } from './DontPushAudioModal';
import { playDontPushAudio } from '../audioUtils';

interface HeaderProps {
  currentVibe: VibeType;
  tabs: TabConfig[];
  activeTabId: string;
  headerConfig: HeaderConfig;
  isEditing?: boolean;
  onSelectVibe: (vibe: VibeType) => void;
  onJumpToTab: (tabId: string) => void;
  onTriggerDontPush?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentVibe,
  tabs,
  activeTabId,
  headerConfig,
  isEditing = false,
  onSelectVibe,
  onJumpToTab,
  onTriggerDontPush,
}) => {
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isDontPushActive, setIsDontPushActive] = useState(false);

  const handleDontPushClick = () => {
    // Play the configured audio
    playDontPushAudio();

    // Trigger visual state
    setIsDontPushActive(true);
    if (onTriggerDontPush) {
      onTriggerDontPush();
    }
    setTimeout(() => {
      setIsDontPushActive(false);
    }, 4000);
  };

  return (
    <>
      <div className="ambient" aria-hidden="true" id="ambient-scenic-backdrop">
        <div className="mist-sky-layer" />
        <div className="mist-teal-layer" />
        <div className="mist-golden-layer" />
        <div className="mist-sunset-layer" />
        <span className="blob blob-azure" />
        <span className="blob blob-emerald" />
        <span className="blob blob-violet" />
      </div>

      <header className="site-header" id="site-header">
        <div className="header-inner">
          <div className="brand" id="brand-header">
            <div style={{ transform: `scale(${headerConfig.logoScale})`, transformOrigin: 'left center' }}>
              <OhkneeLogo />
            </div>
          </div>

          <nav
            className="tabs tabs-flat-row"
            role="tablist"
            aria-label="Reward categories"
            id="site-navigation"
          >
            {tabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              const isRed =
                tab.id === 'fast-easy-money' ||
                tab.label.toLowerCase().includes('150$') ||
                tab.label.toLowerCase().includes('100$') ||
                tab.label.toLowerCase().includes('do in order') ||
                tab.label.toLowerCase().includes('fast easy');

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  className={`tab ${isRed ? 'tab-bright-red' : 'tab-top-tier'} ${isActive ? 'is-active' : ''}`}
                  type="button"
                  role="tab"
                  data-tab={tab.id}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onJumpToTab(tab.id)}
                >
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Audio Configuration Modal */}
      <DontPushAudioModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />
    </>
  );
};
