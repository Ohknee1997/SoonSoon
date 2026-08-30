import React, { useState, useEffect, useRef } from 'react';
import {
  CookedChatMessage,
  INITIAL_COOKED_MESSAGES,
  COOKED_ARGUMENT_EXCHANGES,
  COOKED_CHARACTERS,
  COOKED_SPONSORS,
  USER_COOKED_REPLIES,
} from '../data/radioChatData';

interface CookedChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHAT_ROOMS = [
  { id: 'general', name: 'Cooked: Main Lounge', flag: '🟢', users: '41,567' },
  { id: 'scrap', name: 'Scrap Copper & 5G', flag: '⚡', users: '18,294' },
  { id: 'politics', name: 'GOP vs DNC Tweakers', flag: '🇺🇸', users: '32,105' },
  { id: 'parking', name: 'Waffle House 24/7', flag: '🧇', users: '9,441' },
];

const QUICK_EMOJIS = ['😂', '🔥', '💀', '💸', '⚡', '🦅', '🧢', '🎀', '👀', '💯'];

export const FakeRadioChat: React.FC<CookedChatProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<CookedChatMessage[]>(INITIAL_COOKED_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [typingState, setTypingState] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState(CHAT_ROOMS[0]);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineCount, setOnlineCount] = useState(41567);

  const exchangeIndexRef = useRef<number>(0);
  const stepIndexRef = useRef<number>(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subtle online count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 7) - 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRoomDropdown(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Audio blip
  const playTypingBeep = (freq: number = 700, duration: number = 0.04) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, typingState]);

  // Main automated arguing loop
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setTypingState(null);
      return;
    }

    const scheduleNextDialogue = () => {
      const delay = Math.floor(Math.random() * 5000) + 7000;
      timerRef.current = setTimeout(() => {
        const exchange = COOKED_ARGUMENT_EXCHANGES[exchangeIndexRef.current % COOKED_ARGUMENT_EXCHANGES.length];
        const currentItem = exchange[stepIndexRef.current % exchange.length];
        const charInfo = COOKED_CHARACTERS[currentItem.speaker];

        setTypingState(`${charInfo.name} is typing...`);

        setTimeout(() => {
          const now = new Date();
          const timestamp = now.toTimeString().split(' ')[0];

          const newMsg: CookedChatMessage = {
            id: `msg-${Date.now()}`,
            sender: currentItem.speaker,
            name: charInfo.name,
            handle: charInfo.handle,
            avatar: charInfo.avatar,
            color: charInfo.color,
            badge: charInfo.badge,
            text: currentItem.text,
            timestamp,
          };

          const msgsToAdd: CookedChatMessage[] = [newMsg];

          if (Math.random() > 0.8) {
            const sponsorText = COOKED_SPONSORS[Math.floor(Math.random() * COOKED_SPONSORS.length)];
            msgsToAdd.push({
              id: `msg-sponsor-${Date.now() + 1}`,
              sender: 'sponsor',
              name: 'WaffleHouse_PA',
              handle: '@WaffleHousePA',
              avatar: '📢',
              color: '#38bdf8',
              badge: 'ADMIN',
              text: sponsorText,
              timestamp,
            });
          }

          setMessages((prev) => [...prev.slice(-50), ...msgsToAdd]);
          playTypingBeep(currentItem.speaker === 'dale' || currentItem.speaker === 'tammy' ? 600 : 850, 0.06);

          stepIndexRef.current += 1;
          if (stepIndexRef.current >= exchange.length) {
            stepIndexRef.current = 0;
            exchangeIndexRef.current += 1;
          }

          setTypingState(null);
          scheduleNextDialogue();
        }, 2000);
      }, delay);
    };

    scheduleNextDialogue();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isPlaying]);

  // Format message text with highlighted @mentions
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="stake-mention-tag">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // User message submit handler
  const handleSendMessage = (textToSend?: string) => {
    const raw = textToSend || inputText;
    if (!raw.trim()) return;

    const clean = raw.trim();
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    const userMsg: CookedChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      name: 'You',
      handle: '@Bystander',
      avatar: '⌨️',
      color: '#55e378',
      badge: 'VIP',
      text: clean,
      timestamp,
    };

    setMessages((prev) => [...prev.slice(-50), userMsg]);
    setInputText('');
    setShowEmojiPicker(false);
    playTypingBeep(1000, 0.08);

    setTypingState('AutisticEDDIE & BORINGBUNNY are reacting...');

    setTimeout(() => {
      const replySet = USER_COOKED_REPLIES[Math.floor(Math.random() * USER_COOKED_REPLIES.length)];
      const firstReply = replySet[0];
      const char1 = COOKED_CHARACTERS[firstReply.character];

      const msg1: CookedChatMessage = {
        id: `msg-reply1-${Date.now()}`,
        sender: firstReply.character,
        name: char1.name,
        handle: char1.handle,
        avatar: char1.avatar,
        color: char1.color,
        badge: char1.badge,
        text: firstReply.text(clean),
        timestamp: new Date().toTimeString().split(' ')[0],
      };

      setMessages((prev) => [...prev.slice(-50), msg1]);
      playTypingBeep(650, 0.06);

      if (replySet.length > 1) {
        setTimeout(() => {
          const secondReply = replySet[1];
          const char2 = COOKED_CHARACTERS[secondReply.character];

          const msg2: CookedChatMessage = {
            id: `msg-reply2-${Date.now()}`,
            sender: secondReply.character,
            name: char2.name,
            handle: char2.handle,
            avatar: char2.avatar,
            color: char2.color,
            badge: char2.badge,
            text: secondReply.text(clean),
            timestamp: new Date().toTimeString().split(' ')[0],
          };

          setMessages((prev) => [...prev.slice(-50), msg2]);
          playTypingBeep(850, 0.06);
          setTypingState(null);
        }, 2600);
      } else {
        setTypingState(null);
      }
    }, 1800);
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleStirBeef = () => {
    const exchange = COOKED_ARGUMENT_EXCHANGES[Math.floor(Math.random() * COOKED_ARGUMENT_EXCHANGES.length)];
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    const random1 = exchange[0];
    const random2 = exchange[1];
    const char1 = COOKED_CHARACTERS[random1.speaker];
    const char2 = COOKED_CHARACTERS[random2.speaker];

    const beefMsg1: CookedChatMessage = {
      id: `msg-beef-1-${Date.now()}`,
      sender: random1.speaker,
      name: char1.name,
      handle: char1.handle,
      avatar: char1.avatar,
      color: char1.color,
      badge: char1.badge,
      text: random1.text,
      timestamp,
    };
    const beefMsg2: CookedChatMessage = {
      id: `msg-beef-2-${Date.now() + 1}`,
      sender: random2.speaker,
      name: char2.name,
      handle: char2.handle,
      avatar: char2.avatar,
      color: char2.color,
      badge: char2.badge,
      text: random2.text,
      timestamp,
    };

    setMessages((prev) => [...prev.slice(-50), beefMsg1, beefMsg2]);
    playTypingBeep(1100, 0.1);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`stake-chat-container ${isMinimized ? 'is-minimized' : ''}`}
      id="cooked-chatroom"
      role="region"
      aria-label="Stake Style Live Chat"
      ref={dropdownRef}
    >
      {/* Stake Style Top Bar with Room Selector & Close Button */}
      <div className="stake-chat-header">
        <div className="stake-room-selector-wrap">
          <button
            type="button"
            className="stake-room-dropdown-btn"
            onClick={() => setShowRoomDropdown(!showRoomDropdown)}
            title="Change chat room"
          >
            <span className="stake-room-flag">{selectedRoom.flag}</span>
            <span className="stake-room-name">{selectedRoom.name}</span>
            <span className="stake-dropdown-arrow">▾</span>
          </button>

          {/* Dropdown Menu */}
          {showRoomDropdown && (
            <div className="stake-dropdown-menu">
              {CHAT_ROOMS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className={`stake-dropdown-item ${selectedRoom.id === room.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowRoomDropdown(false);
                  }}
                >
                  <span className="mr-2">{room.flag}</span>
                  <span className="flex-1 text-left">{room.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{room.users}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="stake-header-actions">
          <button
            type="button"
            className={`stake-icon-action-btn ${soundEnabled ? 'is-active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            type="button"
            className={`stake-icon-action-btn ${isPlaying ? 'is-active' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause chat stream' : 'Resume chat stream'}
            aria-label="Pause or resume"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            type="button"
            className="stake-icon-action-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand chat' : 'Minimize chat'}
            aria-label="Minimize"
          >
            {isMinimized ? '▲' : '▼'}
          </button>

          <button
            type="button"
            className="stake-close-btn"
            onClick={onClose}
            title="Close chat"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Roster & Trigger Bar */}
          <div className="stake-roster-subbar">
            <div className="stake-roster-tags">
              <span className="stake-user-pill pill-gop">🧢 AutisticEDDIE (GOP)</span>
              <span className="stake-user-pill pill-dnc">🐰 BORINGBUNNY (DNC)</span>
              <span className="stake-user-pill pill-gop">⚡ METHINMYVIENS (GOP)</span>
              <span className="stake-user-pill pill-dnc">💸 Deeppockets6 (DNC)</span>
            </div>
            <button
              type="button"
              className="stake-beef-trigger-btn"
              onClick={handleStirBeef}
              title="Trigger instant argument"
            >
              ⚡ Spark
            </button>
          </div>

          {/* Message List in Stake Card Style */}
          <div className="stake-messages-viewport" ref={chatScrollRef} tabIndex={0} aria-live="polite">
            {messages.map((msg) => {
              const isMod = msg.sender === 'sponsor';
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`stake-msg-card ${isUser ? 'is-user-msg' : ''}`}
                >
                  <div className="stake-msg-line">
                    {/* VIP Star Icon */}
                    <span className="stake-vip-star" title="VIP Level">
                      {isMod ? '🛡️' : '☆'}
                    </span>

                    {/* Mod / VIP Badge Icon */}
                    {isMod && <span className="stake-mod-badge">M</span>}

                    {/* Sender Name in color */}
                    <span
                      className="stake-sender-name"
                      style={{ color: msg.color || '#55e378' }}
                    >
                      {msg.name}:
                    </span>

                    {/* Text Body with Highlighted Mentions */}
                    <span className="stake-text-content">
                      {renderMessageContent(msg.text)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Live Typing Status */}
            {typingState && (
              <div className="stake-typing-row">
                <span className="stake-typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="stake-typing-label">{typingState}</span>
              </div>
            )}
          </div>

          {/* Quick Debate Sparks Chips */}
          <div className="stake-quick-topics-bar">
            <span className="stake-topics-label">Sparks:</span>
            <button
              type="button"
              className="stake-topic-chip"
              onClick={() => handleSendMessage("Who is stealing the catalytic converters in this town?!")}
            >
              🔩 Catalytic Converters
            </button>
            <button
              type="button"
              className="stake-topic-chip"
              onClick={() => handleSendMessage("Trump or Biden: who has better scrap copper prices?")}
            >
              ⚡ Copper Prices
            </button>
            <button
              type="button"
              className="stake-topic-chip"
              onClick={() => handleSendMessage("Is the government putting 5G in the Waffle House syrup?")}
            >
              🧇 5G Waffle House
            </button>
          </div>

          {/* Stake-Style Input & Footer Area */}
          <div className="stake-input-container">
            <form
              className="stake-form-layout"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              {/* Input field with right-side emoji button */}
              <div className="stake-input-box-wrap">
                <input
                  type="text"
                  className="stake-text-input"
                  placeholder="Type your message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={160}
                />
                <button
                  type="button"
                  className="stake-emoji-toggle-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Insert emoji"
                >
                  🟡
                </button>

                {/* Popover Emoji Picker */}
                {showEmojiPicker && (
                  <div className="stake-emoji-popover">
                    {QUICK_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        className="stake-emoji-item-btn"
                        onClick={() => handleInsertEmoji(em)}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Info Bar with Online Count, Char Limit, and Bright Green Send Button */}
              <div className="stake-input-footer-row">
                {/* Online Indicator */}
                <div className="stake-online-status">
                  <span className="stake-online-indicator-dot" />
                  <span>Online: {onlineCount.toLocaleString()}</span>
                </div>

                {/* Right controls: char count, gif button, green send */}
                <div className="stake-footer-actions">
                  <span className="stake-char-counter">
                    {160 - inputText.length}
                  </span>

                  <button
                    type="button"
                    className="stake-gif-btn"
                    onClick={() => handleSendMessage("⚡ [GIF: Copper Wire Explosion]")}
                    title="Send Quick Reaction"
                  >
                    🎴
                  </button>

                  <button
                    type="submit"
                    className="stake-green-send-btn"
                    disabled={!inputText.trim()}
                    title="Send message"
                  >
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

