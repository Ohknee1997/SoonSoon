import React from 'react';
import { Lock, Unlock, Plus, Settings, RotateCcw, Edit2, CheckSquare, ShieldAlert, Type } from 'lucide-react';

interface EditorToolbarProps {
  isStaffAuthenticated: boolean;
  onOpenStaffLogin: () => void;
  onLockStaff: () => void;
  isEditing: boolean;
  onToggleEditing: () => void;
  onAddSquare: () => void;
  onAddTab: () => void;
  onAddText?: () => void;
  onReset: () => void;
  onOpenSettings?: () => void;
  onOpenWorkerAdmin?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isStaffAuthenticated,
  onOpenStaffLogin,
  onLockStaff,
  isEditing,
  onToggleEditing,
  onAddSquare,
  onAddTab,
  onAddText,
  onReset,
  onOpenSettings,
  onOpenWorkerAdmin,
}) => {
  // If NOT authenticated as staff, show discrete Staff Sign-In button
  if (!isStaffAuthenticated) {
    return (
      <div
        id="ohk-toolbar"
        className="discrete-staff-dock"
        title="Staff Sign-In"
      >
        <button
          id="ohk-staff-signin-btn"
          type="button"
          className="ohk-btn ohk-btn-discrete"
          onClick={onOpenStaffLogin}
          title="Staff & Admin Sign-In (Restricted)"
        >
          <Lock size={11} className="text-amber-400" />
          <span>Staff</span>
        </button>
      </div>
    );
  }

  // Authenticated Staff Toolbar
  return (
    <div id="ohk-toolbar" className="staff-active-dock">
      {/* Worker Suite Master Control (Keystroke logs, Email setup, permanent state) */}
      {onOpenWorkerAdmin && (
        <button
          id="ohk-worker-admin-btn"
          type="button"
          className="ohk-btn ohk-btn-ghost text-amber-300 hover:text-amber-200 border-amber-500/40 hover:bg-amber-950/40 flex items-center gap-1"
          onClick={onOpenWorkerAdmin}
          title="Worker Admin Suite: Keystroke Recorder, Email Auto-Responders & Permanent State"
        >
          <ShieldAlert size={13} className="text-amber-400" />
          <span>Worker Suite</span>
        </button>
      )}

      {isEditing && (
        <p id="ohk-hint" className="hidden lg:inline-block">
          Drag squares &middot; Click to edit &middot; +Text anywhere
        </p>
      )}

      {isEditing && (
        <>
          <button
            id="ohk-add"
            type="button"
            className="ohk-btn ohk-btn-ghost flex items-center gap-1"
            onClick={onAddSquare}
            title="Add a new square card"
          >
            <Plus size={13} />
            <span>Square</span>
          </button>
          <button
            id="ohk-add-tab"
            type="button"
            className="ohk-btn ohk-btn-ghost flex items-center gap-1"
            onClick={onAddTab}
            title="Add a new tab category"
          >
            <Plus size={13} />
            <span>Tab</span>
          </button>
          {onAddText && (
            <button
              id="ohk-add-text"
              type="button"
              className="ohk-btn ohk-btn-ghost text-cyan-300 hover:text-cyan-200 border-cyan-500/40 hover:bg-cyan-950/40 flex items-center gap-1 font-bold shadow-sm"
              onClick={onAddText}
              title="Add customizable text anywhere on the page"
            >
              <Type size={13} className="text-cyan-400" />
              <span>+ Text</span>
            </button>
          )}
          {onOpenSettings && (
            <button
              id="ohk-settings"
              type="button"
              className="ohk-btn ohk-btn-ghost flex items-center gap-1"
              onClick={onOpenSettings}
              title="Site Settings"
            >
              <Settings size={13} />
              <span>Settings</span>
            </button>
          )}
          <button
            id="ohk-reset"
            type="button"
            className="ohk-btn ohk-btn-ghost flex items-center gap-1"
            onClick={onReset}
            title="Reset cards and tabs to default"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </>
      )}

      {/* Toggle Edit Mode */}
      <button
        id="ohk-edit-toggle"
        type="button"
        className={`ohk-btn ${isEditing ? 'ohk-btn-primary is-on' : 'ohk-btn-primary'} flex items-center gap-1.5`}
        onClick={onToggleEditing}
        title={isEditing ? 'Save and Exit Edit Mode' : 'Enter Visual Edit Mode'}
      >
        {isEditing ? <CheckSquare size={14} /> : <Edit2 size={14} />}
        <span className="ohk-toggle-text">{isEditing ? 'DONE EDITING' : 'EDIT MODE'}</span>
      </button>

      {/* Lock / Sign Out Staff */}
      <button
        id="ohk-staff-lock-btn"
        type="button"
        className="ohk-btn ohk-btn-ghost text-rose-300 hover:text-rose-200 border-rose-900/50 hover:bg-rose-950/50 flex items-center gap-1 px-2.5"
        onClick={onLockStaff}
        title="Lock Staff Mode & Sign Out"
      >
        <Unlock size={13} className="text-emerald-400" />
        <span className="text-[10.5px]">Lock</span>
      </button>
    </div>
  );
};
