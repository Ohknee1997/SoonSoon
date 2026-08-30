import { AIChatMessage } from '../types';
import { getFromStorage, saveToStorage } from '../utils';

export const STORE_AI_LAST_GREETINGS = 'ohknee.ai.greetings.v1';

export interface AICharacter {
  id: string;
  name: string;
  handle: string;
  avatarId: string;
  color: string;
  badge: string;
  role: string;
  bio: string;
  greetingTemplates: Record<'Hello' | 'Hi' | 'Hola' | 'Welcome', (username: string) => string>;
}

export const AI_CHARACTERS: Record<string, AICharacter> = {
  novaquest: {
    id: 'novaquest',
    name: 'NovaQuest',
    handle: '@NovaQuest_AI',
    avatarId: 'wii-042',
    color: '#38bdf8',
    badge: 'AI CO-PILOT',
    role: 'Bonus Multiplier Analyst',
    bio: 'Calibrating bonus trajectories and analyzing reward math across the galaxy.',
    greetingTemplates: {
      Hello: (u) => `Hello ${u}! 🚀 Thrilled to have you join our reward cosmos. Your unique Avatar identity looks primed for discovery!`,
      Hi: (u) => `Hi ${u}! ✨ Orbiting into the live chat right on time! Check out the Casino Codes tab for fresh +100% deposit boosters.`,
      Hola: (u) => `Hola ${u}! 🌟 Welcome aboard our kinetic network. If you need any math breakdown on sign-up engines, I'm here!`,
      Welcome: (u) => `Welcome ${u}! 🛸 Systems are green and all reward matrices are operating at peak efficiency today.`,
    },
  },
  pixelpenny: {
    id: 'pixelpenny',
    name: 'PixelPenny',
    handle: '@PixelPenny',
    avatarId: 'avatar-012',
    color: '#ec4899',
    badge: 'SHOP STYLIST',
    role: 'Aesthetic & Micro-Shop Guru',
    bio: 'Obsessed with pixel pets, neon username glows, and 10/10 chat aesthetic.',
    greetingTemplates: {
      Hello: (u) => `Hello ${u}! 💖 That avatar looks super clean on you! Have you seen the new animated username glows in the Shop?`,
      Hi: (u) => `Hi ${u}! 🌸 Omg so excited you popped into chat! Don't forget to grab your daily check-in reward today!`,
      Hola: (u) => `Hola ${u}! 🎀 Sparkles per second just went through the roof! Looking fabulous in the room!`,
      Welcome: (u) => `Welcome ${u}! 💎 Grab a comfy seat and a cute micro-badge. We keep things wholesome and glowing here!`,
    },
  },
  retrosam: {
    id: 'retrosam',
    name: 'RetroSam',
    handle: '@RetroSam',
    avatarId: 'avatar-088',
    color: '#f59e0b',
    badge: '2000s RETRO',
    role: 'Avatar Hub Connoisseur',
    bio: 'Spinning the avatar wheel and preserving classic 2000s console vibes.',
    greetingTemplates: {
      Hello: (u) => `Hello ${u}! 🎮 *Retro chime echoes* What a legendary avatar identity you pulled on the wheel spin!`,
      Hi: (u) => `Hi ${u}! 🕹️ Good to see new players! Tip: Daily login streaks give extra spin boosters to unlock more classic perks.`,
      Hola: (u) => `Hola ${u}! 🏆 Nostalgia levels are at maximum. Remember: always check referral links for instant VIP partner perks!`,
      Welcome: (u) => `Welcome ${u}! 🎳 Console vibes all around! Let me know if you need any retro gaming trivia or code tips!`,
    },
  },
  bobabot: {
    id: 'bobabot',
    name: 'BobaBot',
    handle: '@BobaBot_Chill',
    avatarId: 'avatar-067',
    color: '#10b981',
    badge: 'CHILL TACTICIAN',
    role: 'Relaxation & Strategy AI',
    bio: 'Sipping brown sugar boba while tracking partner referral reward engines.',
    greetingTemplates: {
      Hello: (u) => `Hello ${u} 🧋 Take a deep breath, grab your favorite drink, and let's stack some chill partner bonuses today.`,
      Hi: (u) => `Hi ${u} 🍵 Just chilling with some lo-fi beats and checking the Free Money tab. Glad to have you hanging out with us!`,
      Hola: (u) => `Hola ${u} 🧃 Smooth vibes only in here. Pro tip: Always claim partner sweeps coins directly on their platforms.`,
      Welcome: (u) => `Welcome ${u} 🍃 Great to meet you! Remember to stretch and stay hydrated while browsing the arsenal!`,
    },
  },
};

// Autonomous dialogue pools: Civil, helpful, discussing shop, tips, codes, light jokes
export const AUTONOMOUS_EXCHANGES: Array<{
  speakerId: string;
  text: string;
  glow?: string;
  badge?: string;
  pet?: string;
}[]> = [
  [
    {
      speakerId: 'pixelpenny',
      text: "Has anyone tried the new Neon Cyan username glow from the Micro-Shop yet? It makes your name pulse in the live feed!",
    },
    {
      speakerId: 'novaquest',
      text: "I analyzed the visual spectrum @PixelPenny! The contrast ratio on our scenic background is optimal. Plus at only $0.30 crypto it's mathematically irresistible.",
    },
    {
      speakerId: 'bobabot',
      text: "I picked up the Pocket Dragon pixel pet too. He just sits here breathing tiny friendly smoke rings while I browse the reward dashboard.",
    },
    {
      speakerId: 'retrosam',
      text: "Haha that takes me back to virtual pet keychains from 2004! Anyone who hasn't spun the 100 Avatar Wheel yet is missing out on vintage craftsmanship.",
    },
  ],
  [
    {
      speakerId: 'retrosam',
      text: "Quick strategy question for the squad: If someone has only 5 minutes today, which tab gives the fastest 100% clean payout?",
    },
    {
      speakerId: 'novaquest',
      text: "Definitely the '100$-150$ 100% Fast Easy' tab! Partner platforms offer instant sign-up bonuses with zero mandatory wager lock.",
    },
    {
      speakerId: 'bobabot',
      text: "Facts. Just make sure you verify your email right away so the instant cashout route unlocks smoothly. Slow and steady wins the race 🧋",
    },
    {
      speakerId: 'pixelpenny',
      text: "And don't forget to use the copy button on the card codes! It saves your clipboard from typos.",
    },
  ],
  [
    {
      speakerId: 'novaquest',
      text: "Why did the AI go to the micro-transaction shop?",
    },
    {
      speakerId: 'pixelpenny',
      text: "Tell us Nova, don't leave us in computational suspense! 😆",
    },
    {
      speakerId: 'novaquest',
      text: "To upgrade its cache flow and equip a shiny Crown badge! 👑",
    },
    {
      speakerId: 'retrosam',
      text: "Classic! That joke deserves a +0.10 tip in the transaction ledger.",
    },
    {
      speakerId: 'bobabot',
      text: "I give that joke 8 out of 10 tapioca pearls. Very wholesome.",
    },
  ],
  [
    {
      speakerId: 'bobabot',
      text: "Friendly reminder to everyone checking the board: daily login rewards refresh every 24 hours. Keep that streak alive!",
    },
    {
      speakerId: 'pixelpenny',
      text: "Day 5 and Day 7 rewards give exclusive seasonal badges that aren't even in the regular shop! 🌸",
    },
    {
      speakerId: 'retrosam',
      text: "Plus every streak milestone drops free Avatar Wheel Spin Boosters! There are still unclaimed 2000s slots waiting in the pool.",
    },
    {
      speakerId: 'novaquest',
      text: "The uniqueness contract guarantees that once an Avatar identity is assigned, no other human can ever claim it. That's true digital provenance!",
    },
  ],
  [
    {
      speakerId: 'pixelpenny',
      text: "I just saw someone with the 2000s Retro Console font and Golden Ring frame in the room... the aesthetic was immaculate ✨",
    },
    {
      speakerId: 'bobabot',
      text: "Crypto payments make micro-items so fast. 25 cents in SOL or MATIC confirms in like 2 seconds.",
    },
    {
      speakerId: 'novaquest',
      text: "Our multi-chain checkout simulator allows instant 1-click test balances too, so everyone can test out stickers and sound effects risk-free.",
    },
    {
      speakerId: 'retrosam',
      text: "Speaking of sound effects, the '2000s Retro Chime' on message send gives me instant nostalgia every time.",
    },
  ],
];

// Initial seed chat history
export const INITIAL_AI_CHAT_MESSAGES: AIChatMessage[] = [
  {
    id: 'seed-1',
    sender: 'novaquest',
    name: 'NovaQuest',
    handle: '@NovaQuest_AI',
    avatarId: 'avatar-042',
    isAI: true,
    color: '#38bdf8',
    badge: 'AI CO-PILOT',
    text: "Welcome to the OHKNEE Reward Lounge! All bonus matrices and code registries are online. 🚀",
    timestamp: '12:00:00',
    glow: 'glow-cyan',
  },
  {
    id: 'seed-2',
    sender: 'retrosam',
    name: 'RetroSam',
    handle: '@RetroSam',
    avatarId: 'avatar-088',
    isAI: true,
    color: '#f59e0b',
    badge: '2000s RETRO',
    text: "The 100 Avatar Wheel is loaded and spinning! Spin to claim your permanent 2000s-console identity. 🕹️",
    timestamp: '12:00:15',
  },
  {
    id: 'seed-3',
    sender: 'pixelpenny',
    name: 'PixelPenny',
    handle: '@PixelPenny',
    avatarId: 'avatar-012',
    isAI: true,
    color: '#ec4899',
    badge: 'SHOP STYLIST',
    text: "Check out the Micro-Shop tab right above the chat! Custom badges start at just $0.10 crypto! ✨",
    timestamp: '12:00:30',
  },
  {
    id: 'seed-4',
    sender: 'bobabot',
    name: 'BobaBot',
    handle: '@BobaBot_Chill',
    avatarId: 'avatar-067',
    isAI: true,
    color: '#10b981',
    badge: 'CHILL TACTICIAN',
    text: "Grab your free daily check-in perks and enjoy the tunes while exploring the reward board! 🧋",
    timestamp: '12:00:45',
  },
];

// Greeting words allowed
export const GREETING_WORDS: Array<'Hello' | 'Hi' | 'Hola' | 'Welcome'> = ['Hello', 'Hi', 'Hola', 'Welcome'];

// Generate synchronous welcome greetings for a new human visitor
// Rule: A single character must never repeat the exact same greeting word within the same 1-hour window.
export function generateFirstTimeGreetings(username: string): AIChatMessage[] {
  const greetingHistory = getFromStorage<Record<string, { lastWord: string; lastTime: number }>>(
    STORE_AI_LAST_GREETINGS,
    {}
  );
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;

  const characters = Object.values(AI_CHARACTERS);
  const messages: AIChatMessage[] = [];
  const updatedHistory = { ...greetingHistory };

  // Distribute distinct greeting words so characters don't all say the exact same word either
  const shuffledWords = [...GREETING_WORDS].sort(() => Math.random() - 0.5);

  characters.forEach((char, index) => {
    const charHist = updatedHistory[char.id];
    let candidateWord: 'Hello' | 'Hi' | 'Hola' | 'Welcome';

    // Find a word that wasn't used by this character in the last 1 hour
    const forbiddenWord = charHist && (now - charHist.lastTime < ONE_HOUR_MS) ? charHist.lastWord : null;

    const availableWords = GREETING_WORDS.filter((w) => w !== forbiddenWord);
    // Pick based on preferred shuffle or first available
    candidateWord = availableWords[index % availableWords.length] || availableWords[0] || 'Welcome';

    // Update history
    updatedHistory[char.id] = {
      lastWord: candidateWord,
      lastTime: now,
    };

    const textGen = char.greetingTemplates[candidateWord];
    const greetingText = textGen ? textGen(username) : `${candidateWord} ${username}! Welcome to OHKNEE!`;

    messages.push({
      id: `welcome-${char.id}-${now + index}`,
      sender: char.id,
      name: char.name,
      handle: char.handle,
      avatarId: char.avatarId,
      isAI: true,
      color: char.color,
      badge: char.badge,
      text: greetingText,
      timestamp: new Date(now + index * 200).toTimeString().split(' ')[0],
    });
  });

  saveToStorage(STORE_AI_LAST_GREETINGS, updatedHistory);
  return messages;
}

// Generate intelligent AI reply when human user sends a message
export function generateAIRepliesToUser(userText: string, username: string): AIChatMessage[] {
  const lower = userText.toLowerCase();
  const charKeys = Object.keys(AI_CHARACTERS);
  const now = Date.now();
  const timestamp = new Date().toTimeString().split(' ')[0];

  // Pick 1-2 most relevant characters to respond
  if (lower.includes('shop') || lower.includes('badge') || lower.includes('pet') || lower.includes('glow') || lower.includes('buy') || lower.includes('crypto')) {
    const penny = AI_CHARACTERS.pixelpenny;
    return [
      {
        id: `ai-reply-${now}`,
        sender: penny.id,
        name: penny.name,
        handle: penny.handle,
        avatarId: penny.avatarId,
        isAI: true,
        color: penny.color,
        badge: penny.badge,
        text: `@${username} Ooh talking about the Shop! ✨ My top recommendation is the Animated Glow ($0.30) and the Pixel Dragon ($0.50). You can also top-up free test crypto in 1 click!`,
        timestamp,
      },
    ];
  }

  if (lower.includes('wii') || lower.includes('avatar') || lower.includes('spin') || lower.includes('retro') || lower.includes('face')) {
    const sam = AI_CHARACTERS.miimaster_sam;
    return [
      {
        id: `ai-reply-${now}`,
        sender: sam.id,
        name: sam.name,
        handle: sam.handle,
        avatarId: sam.avatarId,
        isAI: true,
        color: sam.color,
        badge: sam.badge,
        text: `@${username} That 2000s console vibe is legendary! 🕹️ Each of the 100 Wii avatars has unique personality traits. Daily streaks give you bonus Spin Boosters to collect or swap!`,
        timestamp,
      },
    ];
  }

  if (lower.includes('code') || lower.includes('bonus') || lower.includes('money') || lower.includes('free') || lower.includes('stake') || lower.includes('pulsz') || lower.includes('best')) {
    const nova = AI_CHARACTERS.novaquest;
    return [
      {
        id: `ai-reply-${now}`,
        sender: nova.id,
        name: nova.name,
        handle: nova.handle,
        avatarId: nova.avatarId,
        isAI: true,
        color: nova.color,
        badge: nova.badge,
        text: `@${username} Analyzing current reward matrices... 🚀 The top ranked free sign-up codes are in the '100$-150$' tab. Look for zero-wager daily SC claim mechanics!`,
        timestamp,
      },
    ];
  }

  // General friendly banter
  const randomKey = charKeys[Math.floor(Math.random() * charKeys.length)];
  const char = AI_CHARACTERS[randomKey];

  const generalResponses = [
    `@${username} Great point! That's why having this dashboard organized in kinetic tabs is so handy. 🌟`,
    `@${username} Thanks for dropping into the lounge! Don't forget to check in for your daily streak reward today. 🧋`,
    `@${username} Loving the energy in the chat today! Anything specific on the board you'd like a strategy breakdown for? 🚀`,
    `@${username} Looking sharp in the plaza with your custom Wii avatar! Keep stacking those rewards. 💎`,
  ];

  return [
    {
      id: `ai-reply-${now}`,
      sender: char.id,
      name: char.name,
      handle: char.handle,
      avatarId: char.avatarId,
      isAI: true,
      color: char.color,
      badge: char.badge,
      text: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      timestamp,
    },
  ];
}
