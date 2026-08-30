import { ShopItem, CryptoTransaction } from '../types';
import { getFromStorage, saveToStorage } from '../utils';

export const STORE_CRYPTO_TRANSACTIONS = 'ohknee.shop.transactions.v1';

export const SHOP_ITEMS: ShopItem[] = [
  // Core offerings
  {
    id: 'core-username-change',
    name: 'Username Change',
    category: 'core',
    price: 0.25,
    cryptoPriceText: '0.25 USDT / 0.0016 SOL',
    icon: '✏️',
    description: 'Change your permanent chat & profile username anytime.',
    isCore: true,
  },
  {
    id: 'core-pfp-upload',
    name: 'Custom Profile Picture Upload',
    category: 'core',
    price: 0.25,
    cryptoPriceText: '0.25 USDT / 0.0016 SOL',
    icon: '🖼️',
    description: 'Upload your own custom image PFP or switch back to your unique Avatar.',
    isCore: true,
  },

  // Chat Username Badges ($0.10 each)
  {
    id: 'badge-crown',
    name: 'Royal Crown Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '👑',
    previewValue: '👑',
    description: 'Displays a golden crown badge next to your username in chat.',
  },
  {
    id: 'badge-fire',
    name: 'Fire Streak Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🔥',
    previewValue: '🔥',
    description: 'Shows a blazing flame badge beside your username.',
  },
  {
    id: 'badge-spark',
    name: 'Electric Volt Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '⚡',
    previewValue: '⚡',
    description: 'High-voltage lightning bolt badge for quick responders.',
  },
  {
    id: 'badge-diamond',
    name: 'Diamond Gem Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '💎',
    previewValue: '💎',
    description: 'Shimmering diamond gem badge.',
  },
  {
    id: 'badge-whale',
    name: 'Crypto Whale Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🪙',
    previewValue: '🪙',
    description: 'Official gold coin whale badge.',
  },
  {
    id: 'badge-rocket',
    name: 'Moon Rocket Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🚀',
    previewValue: '🚀',
    description: 'Propel your chat messages with a rocket badge.',
  },
  {
    id: 'badge-retro',
    name: '2000s Controller Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🎮',
    previewValue: '🎮',
    description: 'Classic retro console controller badge.',
  },
  {
    id: 'badge-rainbow',
    name: 'Rainbow Aura Badge',
    category: 'badges',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🌈',
    previewValue: '🌈',
    description: 'Bright rainbow badge for cheerful vibes.',
  },

  // Seasonal Mini Badges ($0.15)
  {
    id: 'seasonal-sakura',
    name: 'Sakura Blossom',
    category: 'seasonal',
    price: 0.15,
    cryptoPriceText: '0.15 USDT / 0.001 SOL',
    icon: '🌸',
    previewValue: '🌸',
    description: 'Spring festival limited cherry blossom badge.',
  },
  {
    id: 'seasonal-snowflake',
    name: 'Winter Frost Snowflake',
    category: 'seasonal',
    price: 0.15,
    cryptoPriceText: '0.15 USDT / 0.001 SOL',
    icon: '❄️',
    previewValue: '❄️',
    description: 'Icy crystal snowflake badge.',
  },
  {
    id: 'seasonal-autumn',
    name: 'Golden Maple Leaf',
    category: 'seasonal',
    price: 0.15,
    cryptoPriceText: '0.15 USDT / 0.001 SOL',
    icon: '🍁',
    previewValue: '🍁',
    description: 'Cozy autumn golden leaf badge.',
  },

  // Animated Username Glows ($0.30)
  {
    id: 'glow-cyan',
    name: 'Neon Cyan Glow',
    category: 'glows',
    price: 0.30,
    cryptoPriceText: '0.30 USDT / 0.0019 SOL',
    icon: '✨',
    previewValue: '0 0 10px #38bdf8, 0 0 20px #0284c7',
    description: 'Pulsing electric cyan aura radiating around your username.',
  },
  {
    id: 'glow-sunset',
    name: 'Sunset Blaze Glow',
    category: 'glows',
    price: 0.30,
    cryptoPriceText: '0.30 USDT / 0.0019 SOL',
    icon: '🌅',
    previewValue: '0 0 10px #f97316, 0 0 20px #dc2626',
    description: 'Warm vibrant sunset gradient radiance.',
  },
  {
    id: 'glow-emerald',
    name: 'Emerald Pulse Glow',
    category: 'glows',
    price: 0.30,
    cryptoPriceText: '0.30 USDT / 0.0019 SOL',
    icon: '❇️',
    previewValue: '0 0 10px #22c55e, 0 0 20px #15803d',
    description: 'Lush green cryptocurrency prosperity aura.',
  },
  {
    id: 'glow-goth',
    name: 'Goth Violet Glow',
    category: 'glows',
    price: 0.30,
    cryptoPriceText: '0.30 USDT / 0.0019 SOL',
    icon: '🔮',
    previewValue: '0 0 10px #a855f7, 0 0 20px #6b21a8',
    description: 'Mystic deep violet arcane glow.',
  },
  {
    id: 'glow-gold',
    name: 'Golden Radiance Glow',
    category: 'glows',
    price: 0.30,
    cryptoPriceText: '0.30 USDT / 0.0019 SOL',
    icon: '🌟',
    previewValue: '0 0 10px #fbbf24, 0 0 20px #d97706',
    description: 'Pure 24K shimmering gold username glow.',
  },

  // Mini Pixel Pets ($0.50)
  {
    id: 'pet-cat',
    name: 'Pixel Cat Companion',
    category: 'pets',
    price: 0.50,
    cryptoPriceText: '0.50 USDT / 0.0032 SOL',
    icon: '🐱',
    previewValue: '🐱',
    description: 'Animated pixel kitty that sits and purrs beside your chat messages.',
  },
  {
    id: 'pet-puppy',
    name: 'Robo Puppy Companion',
    category: 'pets',
    price: 0.50,
    cryptoPriceText: '0.50 USDT / 0.0032 SOL',
    icon: '🐶',
    previewValue: '🐶',
    description: 'Loyal cyber pup wagging its tail next to every message.',
  },
  {
    id: 'pet-dragon',
    name: 'Pocket Dragon Companion',
    category: 'pets',
    price: 0.50,
    cryptoPriceText: '0.50 USDT / 0.0032 SOL',
    icon: '🐲',
    previewValue: '🐲',
    description: 'Tiny pocket dragon that puffs friendly smoke rings in chat.',
  },
  {
    id: 'pet-chick',
    name: 'Chirp Chick Companion',
    category: 'pets',
    price: 0.50,
    cryptoPriceText: '0.50 USDT / 0.0032 SOL',
    icon: '🐥',
    previewValue: '🐥',
    description: 'Cute bouncing chick companion cheering on your wins.',
  },
  {
    id: 'pet-alien',
    name: 'Retro 8-Bit Alien',
    category: 'pets',
    price: 0.50,
    cryptoPriceText: '0.50 USDT / 0.0032 SOL',
    icon: '👾',
    previewValue: '👾',
    description: 'Classic arcade space invader floating beside your handle.',
  },

  // Profile Frame Rings ($0.35)
  {
    id: 'frame-gold-wii',
    name: 'Golden Plaza Frame Ring',
    category: 'frames',
    price: 0.35,
    cryptoPriceText: '0.35 USDT / 0.0022 SOL',
    icon: '🟡',
    previewValue: 'gold',
    description: 'Golden championship border ring encircling your avatar.',
  },
  {
    id: 'frame-rainbow',
    name: 'Rainbow Hologram Ring',
    category: 'frames',
    price: 0.35,
    cryptoPriceText: '0.35 USDT / 0.0022 SOL',
    icon: '🌈',
    previewValue: 'rainbow',
    description: 'Multi-color iridescent prism frame ring.',
  },
  {
    id: 'frame-neon-pulse',
    name: 'Neon Pulse Cyber Ring',
    category: 'frames',
    price: 0.35,
    cryptoPriceText: '0.35 USDT / 0.0022 SOL',
    icon: '⭕',
    previewValue: 'neon',
    description: 'Pulsing cyan energy ring with active glow aura.',
  },
  {
    id: 'frame-flame',
    name: 'Flame Aura Ring',
    category: 'frames',
    price: 0.35,
    cryptoPriceText: '0.35 USDT / 0.0022 SOL',
    icon: '🔥',
    previewValue: 'flame',
    description: 'Fiery orange and red border ring.',
  },

  // Username Fonts ($0.25)
  {
    id: 'font-retro-console',
    name: 'Retro Console Serif',
    category: 'fonts',
    price: 0.25,
    cryptoPriceText: '0.25 USDT / 0.0016 SOL',
    icon: '🔤',
    previewValue: '"Pirata One", cursive',
    description: 'Vintage 2000s adventure display font for your handle.',
  },
  {
    id: 'font-cyber-mono',
    name: 'Cyber Monospace',
    category: 'fonts',
    price: 0.25,
    cryptoPriceText: '0.25 USDT / 0.0016 SOL',
    icon: '💻',
    previewValue: '"Courier New", monospace',
    description: 'Clean high-tech monospace font styling.',
  },
  {
    id: 'font-goth-rune',
    name: 'Gothic Rune Style',
    category: 'fonts',
    price: 0.25,
    cryptoPriceText: '0.25 USDT / 0.0016 SOL',
    icon: '🖋️',
    previewValue: '"UnifrakturMaguntia", cursive',
    description: 'Dramatic medieval gothic calligraphy.',
  },
  {
    id: 'font-cinzel',
    name: 'Cinzel Imperial',
    category: 'fonts',
    price: 0.25,
    cryptoPriceText: '0.25 USDT / 0.0016 SOL',
    icon: '🏛️',
    previewValue: '"Cinzel Decorative", serif',
    description: 'Elegant ancient roman decorative typography.',
  },

  // Chat Bubble Colors ($0.20)
  {
    id: 'bubble-teal',
    name: 'Holographic Teal Bubble',
    category: 'bubbles',
    price: 0.20,
    cryptoPriceText: '0.20 USDT / 0.0013 SOL',
    icon: '🫧',
    previewValue: 'linear-gradient(135deg, rgba(13, 148, 136, 0.25), rgba(6, 182, 212, 0.25))',
    description: 'Translucent blue-green oceanic glass bubble style.',
  },
  {
    id: 'bubble-pink',
    name: 'Vaporwave Pink Bubble',
    category: 'bubbles',
    price: 0.20,
    cryptoPriceText: '0.20 USDT / 0.0013 SOL',
    icon: '💖',
    previewValue: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(168, 85, 247, 0.25))',
    description: 'Aesthetic retro pink-purple bubble backdrop.',
  },
  {
    id: 'bubble-gold',
    name: 'Cyber Gold Bubble',
    category: 'bubbles',
    price: 0.20,
    cryptoPriceText: '0.20 USDT / 0.0013 SOL',
    icon: '🪙',
    previewValue: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(234, 179, 8, 0.25))',
    description: 'Shimmering warm gold high-roller message bubble.',
  },

  // Micro Sound Effects ($0.10)
  {
    id: 'sound-ping',
    name: 'Crystal Ping Sound',
    category: 'sounds',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🔊',
    previewValue: 'crystal',
    description: 'Crisp glass chime when you send chat messages.',
  },
  {
    id: 'sound-wii-chime',
    name: '2000s Retro Chime',
    category: 'sounds',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🎵',
    previewValue: 'wii',
    description: 'Authentic 2000s console interface confirmation chime.',
  },
  {
    id: 'sound-retro-8bit',
    name: 'Retro 8-Bit Jump Beep',
    category: 'sounds',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '🕹️',
    previewValue: '8bit',
    description: 'Vintage arcade coin sound effect on message dispatch.',
  },
  {
    id: 'sound-cash',
    name: 'Cash Register Cha-Ching',
    category: 'sounds',
    price: 0.10,
    cryptoPriceText: '0.10 USDT / 0.0006 SOL',
    icon: '💸',
    previewValue: 'cash',
    description: 'Rewarding cash register chime on message send.',
  },

  // Mini Emoji & Sticker Packs ($0.15 - $0.20)
  {
    id: 'stickers-crypto',
    name: 'Crypto Reaction Stickers',
    category: 'stickers',
    price: 0.20,
    cryptoPriceText: '0.20 USDT / 0.0013 SOL',
    icon: '🚀',
    previewValue: 'stickers',
    description: 'Unlock 8 exclusive animated reaction stickers (Moon, Diamond Hands, Bag, Hype).',
  },
  {
    id: 'emoji-pack-arcade',
    name: 'Arcade Emoji Pack',
    category: 'emojis',
    price: 0.15,
    cryptoPriceText: '0.15 USDT / 0.001 SOL',
    icon: '👾',
    previewValue: 'arcade',
    description: 'Unlocks 12 retro pixel emojis in the chat picker.',
  },
];

// Crypto currencies supported in checkout
export interface CryptoCurrencyOption {
  symbol: string;
  name: string;
  network: string;
  icon: string;
  address: string;
  rateToUsd: number; // 1 crypto = X USD
}

export const CRYPTO_OPTIONS: CryptoCurrencyOption[] = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'TRC-20 / ERC-20',
    icon: '💵',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeSTow5KDebY5',
    rateToUsd: 1.0,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'Solana / Polygon',
    icon: '🔵',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    rateToUsd: 1.0,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    network: 'Solana Mainnet',
    icon: '🟣',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    rateToUsd: 155.0,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum / Arbitrum',
    icon: '🔷',
    address: '0x71C...B29837a4e69d678d',
    rateToUsd: 3200.0,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Lightning / Native',
    icon: '₿',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    rateToUsd: 68000.0,
  },
  {
    symbol: 'MATIC',
    name: 'Polygon MATIC',
    network: 'Polygon PoS',
    icon: '💜',
    address: '0x49B...F2A83e47d',
    rateToUsd: 0.65,
  },
];

// Transaction logs
export function getTransactions(): CryptoTransaction[] {
  return getFromStorage<CryptoTransaction[]>(STORE_CRYPTO_TRANSACTIONS, []);
}

export function logTransaction(tx: Omit<CryptoTransaction, 'id' | 'timestamp' | 'txHash' | 'status'> & { status?: CryptoTransaction['status'] }): CryptoTransaction {
  const existing = getTransactions();
  const txHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const fullTx: CryptoTransaction = {
    ...tx,
    id: 'tx-' + Date.now(),
    timestamp: new Date().toISOString(),
    txHash,
    status: tx.status || 'confirmed',
  };

  const updated = [fullTx, ...existing];
  saveToStorage(STORE_CRYPTO_TRANSACTIONS, updated);
  return fullTx;
}
