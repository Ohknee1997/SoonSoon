import React, { useState, useRef } from 'react';
import {
  DontPushAudioConfig,
  DEFAULT_AUDIO_CONFIG,
  STORE_DONT_PUSH_CONFIG,
  playDontPushAudio,
} from '../audioUtils';
import { getFromStorage, saveToStorage } from '../utils';

interface DontPushAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DontPushAudioModal: React.FC<DontPushAudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<DontPushAudioConfig>(() => {
    return getFromStorage<DontPushAudioConfig>(STORE_DONT_PUSH_CONFIG, DEFAULT_AUDIO_CONFIG);
  });
  const [customUrlInput, setCustomUrlInput] = useState<string>(config.audioUrl || '');
  const [fileName, setFileName] = useState<string>('');
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setConfig((prev) => ({
          ...prev,
          sourceType: 'custom',
          audioUrl: dataUrl,
          label: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestAudio = () => {
    setIsPlayingTest(true);
    const testConfig: DontPushAudioConfig = {
      ...config,
      audioUrl: config.sourceType === 'url' ? customUrlInput : config.audioUrl,
    };
    playDontPushAudio(testConfig);
    setTimeout(() => setIsPlayingTest(false), 2000);
  };

  const handleSave = () => {
    const finalConfig: DontPushAudioConfig = {
      ...config,
      audioUrl: config.sourceType === 'url' ? customUrlInput : config.audioUrl,
    };
    saveToStorage(STORE_DONT_PUSH_CONFIG, finalConfig);
    onClose();
  };

  const handleResetDefault = () => {
    setConfig(DEFAULT_AUDIO_CONFIG);
    setCustomUrlInput('');
    setFileName('');
    saveToStorage(STORE_DONT_PUSH_CONFIG, DEFAULT_AUDIO_CONFIG);
  };

  return (
    <div
      className="modal-overlay"
      id="dont-push-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-box"
        id="dont-push-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dont-push-modal-title"
      >
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h3 id="dont-push-modal-title" className="text-lg font-bold text-slate-800">
              Configure "DONT PUSH" Sound
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            id="close-dont-push-modal"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="modal-body space-y-4">
          <p className="text-xs text-slate-600">
            Choose what happens when anyone presses the <strong>DONT PUSH</strong> button. You can select a built-in sound preset, upload an MP3/audio file, or paste an audio URL.
          </p>

          {/* Sound Source Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
              Sound Source
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                  config.sourceType === 'preset'
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setConfig((p) => ({ ...p, sourceType: 'preset' }))}
              >
                Built-in Presets
              </button>
              <button
                type="button"
                className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                  config.sourceType === 'custom'
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setConfig((p) => ({ ...p, sourceType: 'custom' }))}
              >
                Upload Audio File
              </button>
              <button
                type="button"
                className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                  config.sourceType === 'url'
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setConfig((p) => ({ ...p, sourceType: 'url' }))}
              >
                Custom Audio URL
              </button>
            </div>
          </div>

          {/* Presets List */}
          {config.sourceType === 'preset' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">
                Select Built-in Sound Preset:
              </label>
              <select
                className="w-full p-2 border border-slate-300 rounded-md text-xs font-medium bg-white text-slate-800 focus:outline-none focus:border-red-500"
                value={config.presetName || 'siren'}
                onChange={(e) =>
                  setConfig((p) => ({
                    ...p,
                    presetName: e.target.value as DontPushAudioConfig['presetName'],
                  }))
                }
              >
                <option value="siren">🚨 Emergency Alarm & Siren (4s Wailing)</option>
                <option value="airhorn">📯 MLG Airhorn Fanfare Blast</option>
                <option value="bruh">💥 Deep Sub-Bass Boom Drop</option>
                <option value="laser">⚡ Sci-Fi Laser Zap Shockwave</option>
                <option value="glitch">👾 High-Tech Glitch Burst</option>
              </select>
            </div>
          )}

          {/* File Upload Option */}
          {config.sourceType === 'custom' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">
                Upload Your Audio File (.mp3, .wav, .ogg, .m4a):
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 border-2 border-dashed border-red-300 hover:border-red-500 rounded-lg bg-white text-xs font-bold text-red-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>📁 Choose Audio File from Device</span>
              </button>
              {config.audioUrl && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center justify-between">
                  <span className="truncate max-w-[240px]">
                    ✓ Sound Loaded: {fileName || config.label || 'Custom Sound'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((p) => ({
                        ...p,
                        audioUrl: undefined,
                        label: 'Default',
                      }))
                    }
                    className="text-red-500 hover:underline font-bold text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Custom URL Option */}
          {config.sourceType === 'url' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">
                Direct Audio File URL (MP3/WAV):
              </label>
              <input
                type="url"
                placeholder="https://example.com/sound-effect.mp3"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-xs font-mono bg-white text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          {/* Volume Control */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Volume Level:</span>
              <span>{Math.round((config.volume ?? 0.85) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.volume ?? 0.85}
              onChange={(e) =>
                setConfig((p) => ({ ...p, volume: parseFloat(e.target.value) }))
              }
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Test Sound Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestAudio}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                isPlayingTest
                  ? 'bg-red-600 text-white border-red-700 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <span>{isPlayingTest ? '🔊 Playing Audio...' : '▶ Test Sound Now'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-cancel-btn text-xs"
            onClick={handleResetDefault}
          >
            Reset Default
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal-save-btn bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleSave}
            >
              Save Sound
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
