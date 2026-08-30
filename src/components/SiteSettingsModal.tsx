import React from 'react';
import { HeaderConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: HeaderConfig;
  onSave: (config: HeaderConfig) => void;
}

export const SiteSettingsModal: React.FC<Props> = ({ isOpen, onClose, config, onSave }) => {
  if (!isOpen) return null;
  return (
    <div id="ohk-modal">
      <div className="ohk-modal-backdrop" onClick={onClose} />
      <div className="ohk-modal-card">
        <h3 className="ohk-modal-title">Site Settings</h3>
        <label className="ohk-field">
          <span>Logo Scale</span>
          <input
            type="number"
            step="0.1"
            value={config.logoScale}
            onChange={(e) => onSave({ ...config, logoScale: parseFloat(e.target.value) })}
          />
        </label>
        <label className="ohk-field">
          <span>Header Background</span>
          <input
            type="color"
            value={config.headerBg}
            onChange={(e) => onSave({ ...config, headerBg: e.target.value })}
          />
        </label>
        <button className="ohk-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
