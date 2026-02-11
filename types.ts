
export enum View {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  LISTING_NEW = 'LISTING_NEW',
  TRENDS = 'TRENDS',
  LOGS = 'LOGS',
  SETTINGS = 'SETTINGS',
  IMAGE_IA = 'IMAGE_IA',
  CHAT = 'CHAT'
}

export interface Account {
  id: string;
  username: string;
  region: 'UK' | 'FR' | 'DE' | 'US';
  status: 'connected' | 'reauth_required' | 'pending';
  avatarUrl: string;
  settings: {
    minDelayBetweenPosts: number; // in minutes
  };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  priceRange?: { min: number; max: number };
  category: string;
  brand: string;
  color: string;
  size: string;
  condition: string;
  material?: string;
  hashtags: string[];
  status: 'active' | 'sold' | 'draft';
  repostCount: number;
  lastReposted: string | null;
  imageUrl?: string;
  measurements?: {
    shoulder?: number;
    length?: number;
  };
}

export interface BotLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  accountId: string;
}
