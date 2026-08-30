import React from 'react';
import { LayoutGrid, Flame, DollarSign, MessageSquare, User, Lock, Edit3, CheckSquare } from 'lucide-react';
import { TabConfig, UserProfile } from '../types';

interface MobileBottomNavProps {
  tabs?: TabConfig[];
  activeTabId?: string;
  userProfile?: UserProfile | null;
  onSelectTab?: (tabId: string) => void;
  onOpenChat?: () => void;
  onOpenProfile?: () => void;
  isStaffAuthenticated?: boolean;
  onOpenStaffLogin?: () => void;
  isEditing?: boolean;
  onToggleEditing?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  tabs = [],
  activeTabId,
  userProfile,
  onSelectTab,
  onOpenChat,
  onOpenProfile,
  isStaffAuthenticated = false,
  onOpenStaffLogin,
  isEditing = false,
  onToggleEditing,
}) => {
  const casinoTab = tabs.find((t) => t.id === 'casino-codes' || t.label.toLowerCase().includes('casino'));
  const freeTab = tabs.find((t) => t.id === 'free-money' || t.label.toLowerCase().includes('free'));
  const fastTab = tabs.find(
    (t) => t.id === 'fast-easy-money' || t.label.toLowerCase().includes('100$') || t.label.toLowerCase().includes('fast')
  );

  return (
    <nav
      className="mobile-bottom-bar md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex items-center justify-around"
      id="mobile-app-bottom-nav"
      aria-label="Mobile Navigation"
    >
      {/* Tab 1: Earn / Casino Codes */}
      <button
        type="button"
        className={`mobile-nav-item flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition cursor-pointer ${
          activeTabId === casinoTab?.id
            ? 'text-amber-400 font-black'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        onClick={() => casinoTab && onSelectTab?.(casinoTab.id)}
      >
        <div className="relative flex items-center justify-center w-7 h-7">
          <LayoutGrid size={19} className={activeTabId === casinoTab?.id ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''} />
          {activeTabId === casinoTab?.id && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
          )}
        </div>
        <span className="text-[10.5px] font-bold tracking-tight mt-0.5">Casino</span>
      </button>

      {/* Tab 2: Free Money */}
      <button
        type="button"
        className={`mobile-nav-item flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition cursor-pointer ${
          activeTabId === freeTab?.id
            ? 'text-emerald-400 font-black'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        onClick={() => freeTab && onSelectTab?.(freeTab.id)}
      >
        <div className="relative flex items-center justify-center w-7 h-7">
          <DollarSign size={19} className={activeTabId === freeTab?.id ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : ''} />
          {activeTabId === freeTab?.id && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          )}
        </div>
        <span className="text-[10.5px] font-bold tracking-tight mt-0.5">Free Money</span>
      </button>

      {/* Tab 3: Hot $100-$150 (Gemsloot / Freecash Highlight) */}
      <button
        type="button"
        className={`mobile-nav-item flex flex-col items-center justify-center min-w-[58px] min-h-[48px] px-2 py-1 rounded-xl transition cursor-pointer ${
          activeTabId === fastTab?.id
            ? 'text-red-400 font-black'
            : 'text-red-400/80 hover:text-red-300'
        }`}
        onClick={() => fastTab && onSelectTab?.(fastTab.id)}
      >
        <div className="relative flex items-center justify-center w-7 h-7">
          <Flame size={20} className="text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
          <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-red-600 text-white font-black text-[8px] rounded-full uppercase leading-none shadow">
            HOT
          </span>
          {activeTabId === fastTab?.id && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]" />
          )}
        </div>
        <span className="text-[10.5px] font-extrabold tracking-tight mt-0.5">$100-$150</span>
      </button>

      {/* Tab 4: Live Chat Lounge */}
      <button
        type="button"
        className="mobile-nav-item flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition cursor-pointer"
        onClick={onOpenChat}
      >
        <div className="relative flex items-center justify-center w-7 h-7">
          <MessageSquare size={19} />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
        </div>
        <span className="text-[10.5px] font-bold tracking-tight mt-0.5">Chat</span>
      </button>

      {/* Tab 5: Profile or Staff Controls */}
      {isStaffAuthenticated ? (
        <button
          type="button"
          className={`mobile-nav-item flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition cursor-pointer ${
            isEditing ? 'text-emerald-400 font-black' : 'text-amber-400 font-bold'
          }`}
          onClick={onToggleEditing}
          title={isEditing ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          <div className="relative flex items-center justify-center w-7 h-7">
            {isEditing ? <CheckSquare size={19} /> : <Edit3 size={19} />}
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <span className="text-[10.5px] font-bold tracking-tight mt-0.5">
            {isEditing ? 'Done' : 'Staff Edit'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="mobile-nav-item flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition cursor-pointer"
          onClick={onOpenProfile}
        >
          <div className="relative flex items-center justify-center w-7 h-7">
            <User size={19} />
          </div>
          <span className="text-[10.5px] font-bold tracking-tight mt-0.5">Profile</span>
        </button>
      )}
    </nav>
  );
};
