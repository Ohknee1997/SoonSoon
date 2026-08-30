import React, { useState } from 'react';
import {
  Edit3,
  Check,
  Plus,
  Eye,
  Settings,
  RotateCcw,
  Sparkles,
  Sliders,
  FolderPlus,
  Download,
} from 'lucide-react';

interface EditorToolbarProps {
  isEditing: boolean;
  onToggleEditing: () => void;
  onAddSquare: () => void;
  onAddTab: () => void;
  onUnhideAll?: () => void;
  onReset: () => void;
  onOpenSettings?: () => void;
  onOpenDownloads?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isEditing,
  onToggleEditing,
  onAddSquare,
  onAddTab,
  onUnhideAll,
  onReset,
  onOpenSettings,
  onOpenDownloads,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUnhideAllClick = () => {
    if (onUnhideAll) {
      onUnhideAll();
      setFeedback('All Apps Unhidden!');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <aside
      id="ohk-toolbar"
      aria-label="Editor controls"
      className={`fixed bottom-4 right-4 z-50 flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        isEditing ? 'border-amber-400/60 ring-2 ring-amber-400/30' : 'hover:border-white/40'
      }`}
    >
      {/* Active feedback toast */}
      {feedback && (
        <div className="absolute -top-10 right-0 rounded-lg border border-emerald-400/40 bg-emerald-950/90 px-3 py-1 text-xs font-bold text-emerald-200 shadow-lg backdrop-blur-md animate-fade-in">
          {feedback}
        </div>
      )}

      {/* Download Static Files (3 Files) Button */}
      {onOpenDownloads && (
        <button
          id="ohk-download-btn"
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/70 px-3 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-900/80 hover:text-white"
          onClick={onOpenDownloads}
          title="Download the 3 static website deployment files (index.html, data.json, script.js)"
        >
          <Download size={14} className="text-emerald-400" />
          <span>Download (3 Files)</span>
        </button>
      )}

      {/* Main Editing Controls (Visible when Edit Mode is Active) */}
      {isEditing && (
        <>
          {/* Add Square / App Button */}
          <button
            id="ohk-add-square-btn"
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-950/70 px-3 py-2 text-xs font-bold text-sky-200 transition-all hover:bg-sky-900/80 hover:text-white"
            onClick={onAddSquare}
            title="Create a brand new App / Square card on this tab"
          >
            <Plus size={14} className="text-sky-400" />
            <span>Add Square</span>
          </button>

          {/* Add Tab Category Button */}
          <button
            id="ohk-add-tab-btn"
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-purple-400/40 bg-purple-950/70 px-3 py-2 text-xs font-bold text-purple-200 transition-all hover:bg-purple-900/80 hover:text-white"
            onClick={onAddTab}
            title="Create a new Tab category"
          >
            <FolderPlus size={14} className="text-purple-400" />
            <span>Add Tab</span>
          </button>

          {/* Unhide All Hidden Cards Button */}
          {onUnhideAll && (
            <button
              id="ohk-unhide-all-btn"
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-950/70 px-3 py-2 text-xs font-bold text-emerald-200 transition-all hover:bg-emerald-900/80 hover:text-white"
              onClick={handleUnhideAllClick}
              title="Unhide all hidden apps and restore them to the screen"
            >
              <Eye size={14} className="text-emerald-400" />
              <span>Unhide All</span>
            </button>
          )}

          {/* Site Settings Modal Button */}
          {onOpenSettings && (
            <button
              id="ohk-settings-btn"
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800/80 px-2.5 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
              onClick={onOpenSettings}
              title="Adjust Header & Site Settings"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}

          {/* Reset Cards to Default Button */}
          <button
            id="ohk-reset-btn"
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/50 px-2.5 py-2 text-xs font-bold text-rose-300 transition-all hover:bg-rose-900/70 hover:text-white"
            onClick={() => {
              if (window.confirm('Reset all squares and tabs back to default?')) {
                onReset();
              }
            }}
            title="Reset cards to original layout"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </>
      )}

      {/* Primary Toggle Edit Mode Button */}
      <button
        id="ohk-edit-toggle-btn"
        type="button"
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold tracking-wider uppercase transition-all shadow-lg ${
          isEditing
            ? 'border border-amber-300 bg-amber-400 text-slate-950 hover:bg-amber-300 scale-105'
            : 'border border-amber-400/50 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110'
        }`}
        onClick={onToggleEditing}
        title={isEditing ? 'Save and Finish Editing' : 'Open Editing Tool to customize size, color, text, location, and unhide apps'}
      >
        {isEditing ? (
          <>
            <Check size={16} className="stroke-[3]" />
            <span>Done Editing</span>
          </>
        ) : (
          <>
            <Edit3 size={15} />
            <span>Editing Tool</span>
          </>
        )}
      </button>
    </aside>
  );
};
