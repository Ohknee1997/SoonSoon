import React from 'react';
import { Sparkles, Gamepad2, Landmark, Check } from 'lucide-react';

export type MobileDesignOption = 'contemporary' | 'gamified' | 'fintech';

interface MobileThemeSwitcherProps {
  currentOption: MobileDesignOption;
  onSelectOption: (option: MobileDesignOption) => void;
  onOpenInfo?: () => void;
}

export const MobileThemeSwitcher: React.FC<MobileThemeSwitcherProps> = ({
  currentOption,
  onSelectOption,
  onOpenInfo,
}) => {
  const options: Array<{
    id: MobileDesignOption;
    num: string;
    name: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'contemporary',
      num: '1',
      name: 'Clean & Contemporary',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      id: 'gamified',
      num: '2',
      name: 'Gamified & Punchy',
      icon: <Gamepad2 className="w-3.5 h-3.5 text-orange-400" />,
      color: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/40',
    },
    {
      id: 'fintech',
      num: '3',
      name: 'FinTech Premium',
      icon: <Landmark className="w-3.5 h-3.5 text-sky-400" />,
      color: 'from-sky-500/20 to-indigo-500/20 text-sky-400 border-sky-500/40',
    },
  ];

  return (
    <div className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 py-2 shadow-lg">
      <div className="flex items-center justify-between gap-1.5 mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
            📱
          </span>
          <span className="text-[11px] font-black tracking-wider uppercase text-slate-300">
            Mobile Redesign Options
          </span>
        </div>
        {onOpenInfo && (
          <button
            type="button"
            onClick={onOpenInfo}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            Prompt Details ℹ️
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        {options.map((opt) => {
          const isActive = currentOption === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectOption(opt.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all text-center relative cursor-pointer ${
                isActive
                  ? `bg-gradient-to-b ${opt.color} border shadow-md scale-[1.02]`
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                {opt.icon}
                <span className="text-[11px] font-extrabold">{opt.num}</span>
              </div>
              <span className={`text-[10px] font-bold leading-tight line-clamp-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {opt.id === 'contemporary' ? 'Contemporary' : opt.id === 'gamified' ? 'Gamified' : 'FinTech'}
              </span>
              {isActive && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-500 text-slate-950 rounded-full flex items-center justify-center shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
