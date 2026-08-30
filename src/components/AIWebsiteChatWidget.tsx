import React, { useState, useEffect, useRef } from 'react';
import { AIChatMessage, UserProfile, ShopItem } from '../types';
import {
  AI_CHARACTERS,
  AUTONOMOUS_EXCHANGES,
  INITIAL_AI_CHAT_MESSAGES,
  generateFirstTimeGreetings,
  generateAIRepliesToUser,
} from '../data/aiChatData';
import { getAvatarById } from '../data/wiiAvatars';
import { WiiFaceIcon } from './WiiFaceIcon';
import { MicroShopTab } from './MicroShopTab';
import { playCustomChatSound } from '../audioUtils';
import { getFromStorage, saveToStorage } from '../utils';
import { logActivity, triggerSupportAutoResponder } from '../utils/activityLogger';

const STORE_AI_CHAT_HISTORY = 'ohknee.ai.chat.history.v1';
const STORE_HAS_GREETED_USER = 'ohknee.ai.has_greeted_user.v1';

interface AIWebsiteChatWidgetProps {
  isOpen: boolean;
  userProfile: UserProfile | null;
  onClose: () => void;
  onSelectItemToBuy: (item: ShopItem) => void;
  onOpenProfileModal: () => void;
  onOpenAvatarSpinner: () => void;
  onProfileUpdated: (profile: UserProfile) => void;
}

const QUICK_REACTION_EMOJIS = ['🚀', '💎', '👑', '🔥', '🧋', '✨', '🎮', '🌸', '💯', '💸'];

export const AIWebsiteChatWidget: React.FC<AIWebsiteChatWidgetProps> = ({
  isOpen,
  userProfile,
  onClose,
  onSelectItemToBuy,
  onOpenProfileModal,
  onOpenAvatarSpinner,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'shop'>('chat');
  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    return getFromStorage<AIChatMessage[]>(STORE_AI_CHAT_HISTORY, INITIAL_AI_CHAT_MESSAGES);
  });
  const [inputText, setInputText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [typingState, setTypingState] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const exchangeIndexRef = useRef<number>(0);
  const stepIndexRef = useRef<number>(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const autoChatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist messages whenever updated
  useEffect(() => {
    saveToStorage(STORE_AI_CHAT_HISTORY, messages.slice(-80));
  }, [messages]);

  // First-time welcome greeting check:
  // When a human user enters chat with a username for the first time, all AI characters greet simultaneously
  useEffect(() => {
    if (!isOpen || !userProfile?.username) return;

    const greetedUsers = getFromStorage<Record<string, boolean>>(STORE_HAS_GREETED_USER, {});

    if (!greetedUsers[userProfile.username]) {
      // Generate simultaneous first-time welcome greetings adhering to 1-hour anti-repetition rule
      const welcomeMessages = generateFirstTimeGreetings(userProfile.username);

      setTypingState('AI Crew is welcoming you to the lounge...');

      setTimeout(() => {
        setMessages((prev) => [...prev, ...welcomeMessages]);
        setTypingState(null);
        greetedUsers[userProfile.username] = true;
        saveToStorage(STORE_HAS_GREETED_USER, greetedUsers);
        if (soundEnabled) {
          playCustomChatSound('wii');
        }
      }, 1500);
    }
  }, [isOpen, userProfile?.username, soundEnabled]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current && activeTab === 'chat') {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, typingState, activeTab]);

  // Autonomous AI chatter loop (chatter every 10–20 seconds)
  useEffect(() => {
    if (!isOpen || isPaused || activeTab !== 'chat') {
      if (autoChatTimerRef.current) clearTimeout(autoChatTimerRef.current);
      setTypingState(null);
      return;
    }

    const scheduleNextAutonomousChat = () => {
      // 10 to 20 seconds delay
      const delayMs = Math.floor(Math.random() * 10000) + 10000;

      autoChatTimerRef.current = setTimeout(() => {
        const exchange = AUTONOMOUS_EXCHANGES[exchangeIndexRef.current % AUTONOMOUS_EXCHANGES.length];
        const item = exchange[stepIndexRef.current % exchange.length];
        const speaker = AI_CHARACTERS[item.speakerId] || AI_CHARACTERS.novaquest;

        setTypingState(`${speaker.name} is typing...`);

        setTimeout(() => {
          const now = new Date();
          const timestamp = now.toTimeString().split(' ')[0];

          const newMsg: AIChatMessage = {
            id: `ai-msg-${Date.now()}`,
            sender: speaker.id,
            name: speaker.name,
            handle: speaker.handle,
            avatarId: speaker.avatarId,
            isAI: true,
            color: speaker.color,
            badge: speaker.badge,
            glow: item.glow,
            pet: item.pet,
            text: item.text,
            timestamp,
          };

          setMessages((prev) => [...prev.slice(-70), newMsg]);
          setTypingState(null);

          if (soundEnabled) {
            playCustomChatSound('crystal');
          }

          stepIndexRef.current += 1;
          if (stepIndexRef.current >= exchange.length) {
            stepIndexRef.current = 0;
            exchangeIndexRef.current += 1;
          }

          scheduleNextAutonomousChat();
        }, 1800);
      }, delayMs);
    };

    scheduleNextAutonomousChat();

    return () => {
      if (autoChatTimerRef.current) clearTimeout(autoChatTimerRef.current);
    };
  }, [isOpen, isPaused, activeTab, soundEnabled]);

  // Send human message
  const handleSendMessage = (customText?: string) => {
    const raw = customText || inputText;
    if (!raw.trim() || !userProfile) return;

    const clean = raw.trim();
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    const humanAvatar = getAvatarById(userProfile.avatarId);

    const userMsg: AIChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: userProfile.username,
      name: userProfile.username,
      handle: `@${userProfile.username}`,
      avatarId: userProfile.avatarId,
      customPfpUrl: userProfile.customPfpUrl,
      isAI: false,
      color: '#38bdf8',
      badge: userProfile.equippedBadge,
      glow: userProfile.equippedGlow,
      pet: userProfile.equippedPet,
      bubbleStyle: userProfile.equippedBubble,
      fontStyle: userProfile.equippedFont,
      text: clean,
      timestamp,
    };

    setMessages((prev) => [...prev.slice(-70), userMsg]);
    setInputText('');
    setShowEmojiPicker(false);

    // Master Audit Log & Support Auto-responder
    logActivity({
      eventType: 'chat_message',
      fieldId: 'ai_chat_input',
      fieldName: `Chat from @${userProfile.username}`,
      value: clean,
      context: 'AI Community Chat',
      username: userProfile.username,
    });

    if (
      clean.toLowerCase().includes('help') ||
      clean.toLowerCase().includes('support') ||
      clean.toLowerCase().includes('problem') ||
      clean.toLowerCase().includes('issue') ||
      clean.toLowerCase().includes('contact') ||
      clean.toLowerCase().includes('email') ||
      clean.toLowerCase().includes('bug')
    ) {
      triggerSupportAutoResponder(
        userProfile.email || `${userProfile.username}@user.ohknee.com`,
        userProfile.username,
        clean
      );
    }

    // Play equipped sound
    if (soundEnabled) {
      playCustomChatSound(userProfile.equippedSound || 'sound-ping');
    }

    // Increment message count
    onProfileUpdated({
      ...userProfile,
      totalMessages: (userProfile.totalMessages || 0) + 1,
    });

    // Trigger AI response after short delay
    setTypingState('AI Co-Pilot is reviewing...');
    setTimeout(() => {
      const replies = generateAIRepliesToUser(clean, userProfile.username);
      setMessages((prev) => [...prev.slice(-70), ...replies]);
      setTypingState(null);
      if (soundEnabled) {
        playCustomChatSound('crystal');
      }
    }, 1500);
  };

  // Spark instant AI tip or discussion
  const handleSparkAITip = () => {
    const exchange = AUTONOMOUS_EXCHANGES[Math.floor(Math.random() * AUTONOMOUS_EXCHANGES.length)];
    const msg1 = exchange[0];
    const msg2 = exchange[1];
    const speaker1 = AI_CHARACTERS[msg1.speakerId] || AI_CHARACTERS.novaquest;
    const speaker2 = AI_CHARACTERS[msg2.speakerId] || AI_CHARACTERS.pixelpenny;

    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    const aiMsg1: AIChatMessage = {
      id: `spark-1-${Date.now()}`,
      sender: speaker1.id,
      name: speaker1.name,
      handle: speaker1.handle,
      avatarId: speaker1.avatarId,
      isAI: true,
      color: speaker1.color,
      badge: speaker1.badge,
      text: msg1.text,
      timestamp,
    };

    const aiMsg2: AIChatMessage = {
      id: `spark-2-${Date.now() + 1}`,
      sender: speaker2.id,
      name: speaker2.name,
      handle: speaker2.handle,
      avatarId: speaker2.avatarId,
      isAI: true,
      color: speaker2.color,
      badge: speaker2.badge,
      text: msg2.text,
      timestamp,
    };

    setMessages((prev) => [...prev.slice(-70), aiMsg1, aiMsg2]);
    if (soundEnabled) playCustomChatSound('wii');
  };

  if (!isOpen) return null;

  const currentHumanAvatar = userProfile ? getAvatarById(userProfile.avatarId) : null;

  return (
    <div
      className={`fixed top-3 right-3 md:top-4 md:right-4 z-[999] w-[calc(100vw-1.5rem)] sm:w-[380px] md:w-[410px] bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden transition-all duration-200 ${
        isMinimized ? 'h-14' : 'h-[580px] max-h-[88vh]'
      }`}
      id="ai-website-chat-widget"
      role="region"
      aria-label="AI Website Chat, Shop & Profile System"
    >
      {/* Top Header Bar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🛍️</span>
            <span>Shop</span>
          </button>
        </div>

        {/* Profile Quick Pill */}
        {userProfile && (
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition cursor-pointer text-xs"
            title="Open Profile & Avatar Settings"
          >
            <WiiFaceIcon avatar={currentHumanAvatar} customPfpUrl={userProfile.customPfpUrl} size={22} />
            <span className="font-bold text-slate-200 truncate max-w-[80px]">
              @{userProfile.username}
            </span>
          </button>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              soundEnabled ? 'text-cyan-400 hover:bg-cyan-950/40' : 'text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              isPaused ? 'text-amber-400 hover:bg-amber-950/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title={isPaused ? 'Resume AI chatter' : 'Pause AI chatter'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isMinimized && (
        <>
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100">
              {/* AI Cast & Spark Tip Bar */}
              <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-slate-500 font-bold text-[10px] uppercase">AI Cast:</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px]">
                    NovaQuest
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold text-[10px]">
                    PixelPenny
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    RetroSam
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    BobaBot
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSparkAITip}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-[10px] transition shrink-0 cursor-pointer flex items-center gap-1"
                  title="Trigger instant AI advice"
                >
                  <span>⚡ AI Tip</span>
                </button>
              </div>

              {/* Messages Viewport */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar"
                tabIndex={0}
              >
                {messages.map((msg) => {
                  const avatar = msg.avatarId ? getAvatarById(msg.avatarId) : null;
                  const isUser = !msg.isAI;

                  // Render text with highlight on @mentions
                  const parts = msg.text.split(/(@\w+)/g);

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 group transition ${
                        isUser ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar Icon */}
                      <div className="shrink-0 pt-0.5">
                        <WiiFaceIcon
                          avatar={avatar}
                          customPfpUrl={msg.customPfpUrl}
                          size={32}
                          frame={isUser ? userProfile?.equippedFrame : undefined}
                        />
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[82%] rounded-2xl p-2.5 text-xs transition ${
                          isUser
                            ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/50 text-white rounded-tr-sm'
                            : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-sm'
                        }`}
                        style={{
                          background: msg.bubbleStyle ? msg.bubbleStyle : undefined,
                        }}
                      >
                        {/* Header: Name + Badge + Time */}
                        <div
                          className={`flex items-center gap-1.5 mb-1 ${
                            isUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span
                            className="font-bold text-[11px]"
                            style={{
                              color: msg.color || '#38bdf8',
                              textShadow: msg.glow ? '0 0 10px #38bdf8' : undefined,
                              fontFamily: msg.fontStyle ? msg.fontStyle : undefined,
                            }}
                          >
                            {msg.name}
                          </span>

                          {msg.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] font-black text-amber-300 border border-slate-700">
                              {msg.badge}
                            </span>
                          )}

                          {msg.pet && <span className="text-xs">{msg.pet}</span>}

                          <span className="text-[9px] text-slate-500 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Content Body */}
                        <div className="leading-relaxed break-words">
                          {parts.map((part, pIdx) => {
                            if (part.startsWith('@')) {
                              return (
                                <span
                                  key={pIdx}
                                  className="text-cyan-300 font-bold bg-cyan-950/60 px-1 py-0.2 rounded"
                                >
                                  {part}
                                </span>
                              );
                            }
                            return part;
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {typingState && (
                  <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-medium animate-pulse px-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{typingState}</span>
                  </div>
                )}
              </div>

              {/* Quick Emojis Drawer */}
              {showEmojiPicker && (
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
                  {QUICK_REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInputText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1 text-base hover:scale-125 transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Emoji reactions"
                >
                  😊
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    userProfile
                      ? `Chat with AI crew as @${userProfile.username}...`
                      : 'Please choose a username to chat...'
                  }
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition"
                />

                <button
                  type="button"
                  disabled={!inputText.trim()}
                  onClick={() => handleSendMessage()}
                  className="p-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:from-cyan-300 hover:to-blue-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-cyan-500/20 cursor-pointer"
                  title="Send message"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <MicroShopTab
                userProfile={userProfile}
                onSelectItemToBuy={onSelectItemToBuy}
                onProfileUpdated={onProfileUpdated}
                onOpenAvatarSpinner={onOpenAvatarSpinner}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
