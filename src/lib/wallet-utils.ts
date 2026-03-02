// BIP39 wordlist (simplified - first 100 words for demo)
// In production, use full 2048 BIP39 wordlist
const BIP39_WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
  'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
  'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
  'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
  'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
  'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
  'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
  'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
  'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
  'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
  'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
  'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
  'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
  'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
  'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
  'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
  'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
  'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
];

// Generate a random seed phrase (12 or 24 words)
export function generateSeedPhrase(wordCount: 12 | 24 = 12): string[] {
  const words: string[] = [];
  const usedIndices = new Set<number>();
  
  while (words.length < wordCount) {
    const randomIndex = Math.floor(Math.random() * BIP39_WORDLIST.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      words.push(BIP39_WORDLIST[randomIndex]);
    }
  }
  
  return words;
}

// Generate a mock wallet address
export function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let address = 'byx1';
  for (let i = 0; i < 38; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

// Simple hash function for PIN (in production use proper crypto)
export function hashPin(pin: string): string {
  return btoa(pin + 'byx_salt_' + pin.split('').reverse().join(''));
}

// Encrypt seed phrase (simple XOR for demo - use proper encryption in production)
export function encryptSeedPhrase(words: string[], pin: string): string {
  const phrase = words.join(' ');
  const key = hashPin(pin);
  return btoa(phrase + '::' + key);
}

// Validate seed phrase
export function validateSeedPhrase(words: string[]): boolean {
  if (words.length !== 12 && words.length !== 24) {
    return false;
  }
  
  return words.every(word => 
    BIP39_WORDLIST.includes(word.toLowerCase().trim())
  );
}

// Format address for display
export function formatAddress(address: string, chars: number = 8): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Validate PIN format (4-6 digits)
export function validatePin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
