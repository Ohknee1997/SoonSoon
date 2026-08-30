import React from 'react';
import { X, Sparkles, Gamepad2, Landmark } from 'lucide-react';
import { MobileDesignOption } from './MobileThemeSwitcher';

interface MobilePromptInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOption: MobileDesignOption;
  onSelectOption: (option: MobileDesignOption) => void;
}

export const MobilePromptInfoModal: React.FC<MobilePromptInfoModalProps> = ({
  isOpen,
  onClose,
  currentOption,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  const prompts = [
    {
      id: 'contemporary' as MobileDesignOption,
      title: '1. The Clean & Contemporary UI Approach',
      badge: 'Dark Mode & Electric Lime',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      desc: 'Focuses on sleek card architecture, strong visual hierarchy, and modern typography to keep high-density offers from looking chaotic.',
      quote:
        '"Design a modern, minimalist mobile app UI for a modern rewards and promo code app called \'Gym Loot\'. Dark mode, clean aesthetic using deep charcoal gray, sleek electric lime accents, and high-contrast crisp white typography. Layout features organized, floating glassmorphism cards for featured offers, prominent percentage-off badges, clear call-to-action buttons (\'Claim Code\'), and smooth rounded corners. Professional, uncluttered layout with balanced white space, high usability, and premium visual hierarchy. UI mockup on a modern iPhone display, 8k resolution, photorealistic render."',
    },
    {
      id: 'gamified' as MobileDesignOption,
      title: '2. The Gamified & Punchy Approach',
      badge: 'Neo-Brutalist & Neon Glow',
      icon: <Gamepad2 className="w-5 h-5 text-orange-400" />,
      desc: 'Leverages high-energy visuals, bold gradients, and tactile "loot" aesthetics to make claiming deals feel engaging and dynamic.',
      quote:
        '"Mobile app user interface for a high-energy fitness loot and rewards app. Neo-brutalist tech aesthetic with bold typography, vivid neon accents (neon orange and electric green), dark background, and tactile 3D elements like glowing loot chests or keycards for promo codes. The home feed displays interactive deal cards with live countdown timers, bold discount tags, and vibrant unlock buttons. Modern, dynamic, and engaging mobile game-inspired dashboard UI, polished App Store design showcase."',
    },
    {
      id: 'fintech' as MobileDesignOption,
      title: '3. The Minimalist FinTech / Premium Approach',
      badge: 'Revolut & Cash App Inspired',
      icon: <Landmark className="w-5 h-5 text-sky-400" />,
      desc: 'Borrows design cues from top-tier finance and shopping apps, creating an ultra-clean, trustworthy feel.',
      quote:
        '"Sleek, ultra-minimalist mobile app UI design for a cashback and deal-discovery app called \'Gym Loot\'. Matte black and subtle brushed slate background, sharp typography, minimalist icons, and subtle metallic accents. Features a clean top banner showing current balance, followed by an elegant vertical feed of merchant offers, instant code copy-paste triggers, and subtle micro-interactions. Premium, sophisticated fintech app design, realistic mobile screen display, clean vector UI layout."',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <h2 className="text-white font-extrabold text-base">Mobile Redesign Options</h2>
            <p className="text-xs text-slate-400">Choose and compare the 3 design archetypes</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {prompts.map((p) => {
            const isSelected = currentOption === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectOption(p.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {p.icon}
                    <h3 className="font-extrabold text-sm text-white">{p.title}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2">{p.desc}</p>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 font-mono italic leading-relaxed">
                  {p.quote}
                </div>

                <div className="mt-2.5 flex justify-end">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ Active Theme' : 'Select This Design'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
