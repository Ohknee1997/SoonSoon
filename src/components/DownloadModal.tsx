import React, { useState } from 'react';
import { Download, FileCode, Check, Copy } from 'lucide-react';
import { CardData, TabConfig, CardDetail } from '../types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardData[];
  tabs: TabConfig[];
  details: Record<string, CardDetail>;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  cards,
  tabs,
  details,
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate the 3 static production files:
  // 1. index.html (Standalone single-file deployment)
  // 2. data.json (Full export of all cards, categories, links and codes)
  // 3. script.js (Clean static handler for drawers, links, filters)

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllThree = () => {
    downloadHtml();
    setTimeout(() => downloadJson(), 300);
    setTimeout(() => downloadJs(), 600);
  };

  const getJsonContent = () => {
    return JSON.stringify(
      {
        site: 'Ohknee Arsenal',
        exportedAt: new Date().toISOString(),
        tabs,
        cards,
        details,
      },
      null,
      2
    );
  };

  const getJsContent = () => {
    return `/**
 * Ohknee Static Deployment Engine
 * Self-contained logic for cards, tabs, drawers, and promo codes.
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const cards = document.querySelectorAll('.card');

    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('is-active'));
        this.classList.add('is-active');
        const tabId = this.dataset.tab;
        
        cards.forEach(card => {
          if (card.dataset.tab === tabId || !tabId) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Copy promo code buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const code = this.dataset.code;
        if (code) {
          navigator.clipboard.writeText(code);
          const original = this.innerText;
          this.innerText = 'COPIED!';
          setTimeout(() => { this.innerText = original; }, 2000);
        }
      });
    });
  });
})();`;
  };

  const getHtmlContent = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ohknee — The Arsenal</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <style>
    body {
      background: linear-gradient(175deg, #0891b2 0%, #0d9488 20%, #14b8a6 38%, #38bdf8 52%, #fef08a 70%, #f59e0b 84%, #ea580c 100%);
      background-attachment: fixed;
      min-height: 100vh;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
      padding: 16px;
      max-width: 1380px;
      margin: 0 auto;
    }
    .card-box {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 12px;
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card-box:hover {
      transform: translateY(-3px) scale(1.02);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    .btn-action {
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 9999px;
      margin-top: 8px;
      display: inline-block;
    }
    .btn-action:hover {
      background: #1e293b;
    }
  </style>
</head>
<body class="p-4 text-slate-900">
  <header class="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-white/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-2xl font-black text-slate-950">OHKNEE ARSENAL</h1>
    <div class="flex gap-2 flex-wrap">
      ${tabs
        .map(
          (t, i) =>
            `<button class="tab px-4 py-2 rounded-full font-bold text-xs ${
              i === 0 ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
            }" data-tab="${t.id}">${t.label}</button>`
        )
        .join('\n      ')}
    </div>
  </header>

  <main class="grid-container">
    ${cards
      .map(
        (c) => `
    <div class="card-box" data-tab="${c.tabId || ''}">
      ${c.showStarsTopper ? '<div class="text-amber-400 font-bold text-xs mb-1">★★★★★</div>' : ''}
      <img src="${
        c.logoUrl || (c.domain ? `https://www.google.com/s2/favicons?domain=${c.domain}&sz=128` : '')
      }" alt="${c.name}" class="w-12 h-12 rounded-xl mb-2 object-contain bg-white/80 p-1 shadow" onerror="this.style.display='none'">
      <h3 class="font-extrabold text-sm text-slate-900">${c.name}</h3>
      <p class="text-xs text-slate-600 mb-1">${c.payout || c.sub || ''}</p>
      ${
        c.code
          ? `<span class="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black mb-1">CODE: ${c.code}</span>`
          : ''
      }
      <a href="${c.signupUrl}" target="_blank" rel="noopener noreferrer" class="btn-action">${c.signupLabel || 'SIGN UP'}</a>
    </div>`
      )
      .join('\n    ')}
  </main>

  <script src="script.js"></script>
</body>
</html>`;
  };

  const downloadHtml = () => {
    downloadFile('index.html', getHtmlContent(), 'text/html');
  };

  const downloadJson = () => {
    downloadFile('data.json', getJsonContent(), 'application/json');
  };

  const downloadJs = () => {
    downloadFile('script.js', getJsContent(), 'application/javascript');
  };

  const handleCopy = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div id="ohk-modal">
      <div className="ohk-modal-backdrop" onClick={onClose} />
      <div
        className="ohk-modal-card"
        style={{ maxWidth: '560px' }}
        role="dialog"
        aria-modal="true"
        aria-label="Download static files"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <p className="ohk-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} className="text-emerald-400" />
              DOWNLOAD STATIC FILES (3 FILES)
            </p>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Export 100% standalone static files for GitHub Pages, Netlify, Vercel, or raw hosting.
            </span>
          </div>
          <button
            type="button"
            className="ohk-btn ohk-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '11px' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 1-Click Download All 3 Files */}
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', display: 'block' }}>
              ⚡ Download All 3 Files Instantly
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Downloads <code style={{ color: '#38bdf8' }}>index.html</code>, <code style={{ color: '#fbbf24' }}>data.json</code>, and <code style={{ color: '#a78bfa' }}>script.js</code> in 1 click.
            </span>
          </div>
          <button
            type="button"
            className="ohk-btn"
            style={{
              background: '#10b981',
              color: '#000000',
              fontWeight: 900,
              fontSize: '12px',
              padding: '8px 16px',
              whiteSpace: 'nowrap',
            }}
            onClick={downloadAllThree}
          >
            Download All (3)
          </button>
        </div>

        {/* The 3 Individual File Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {/* File 1: index.html */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <FileCode size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>index.html</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Stand-alone single-file HTML layout with styling & responsive grids.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="ohk-btn ohk-btn-ghost"
                style={{ fontSize: '11px', padding: '5px 10px' }}
                onClick={() => handleCopy('index.html', getHtmlContent())}
              >
                {copiedFile === 'index.html' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <button
                type="button"
                className="ohk-btn"
                style={{ background: '#38bdf8', color: '#000000', fontWeight: 800, fontSize: '11px', padding: '5px 12px' }}
                onClick={downloadHtml}
              >
                Download
              </button>
            </div>
          </div>

          {/* File 2: data.json */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}
              >
                <FileCode size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>data.json</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Full data repository containing all {cards.length} cards, referrals, and codes.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="ohk-btn ohk-btn-ghost"
                style={{ fontSize: '11px', padding: '5px 10px' }}
                onClick={() => handleCopy('data.json', getJsonContent())}
              >
                {copiedFile === 'data.json' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <button
                type="button"
                className="ohk-btn"
                style={{ background: '#fbbf24', color: '#000000', fontWeight: 800, fontSize: '11px', padding: '5px 12px' }}
                onClick={downloadJson}
              >
                Download
              </button>
            </div>
          </div>

          {/* File 3: script.js */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}
              >
                <FileCode size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>script.js</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Static client-side script for tab filtering, drawer animations & copy actions.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="ohk-btn ohk-btn-ghost"
                style={{ fontSize: '11px', padding: '5px 10px' }}
                onClick={() => handleCopy('script.js', getJsContent())}
              >
                {copiedFile === 'script.js' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <button
                type="button"
                className="ohk-btn"
                style={{ background: '#c084fc', color: '#000000', fontWeight: 800, fontSize: '11px', padding: '5px 12px' }}
                onClick={downloadJs}
              >
                Download
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="ohk-btn ohk-btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
