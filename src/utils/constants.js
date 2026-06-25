import {Dimensions} from 'react-native';

export const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} =
  Dimensions.get('window');


export const API_BASE_URL = 'https://devinternal.buziness.ai/api/post/trpc';
export const API_TOKEN = '1KtTgaJHDAdcG59zwGj48fLowu5cCB8e';

export const ENDPOINTS = {
  GET_REELS: '/posts.getReels',
  TOGGLE_LIKE: '/social.toggleLike',
};


export const STORAGE_KEYS = {
  REELS: '@reels_cache',
  NEXT_CURSOR: '@reels_next_cursor',
  PENDING_ACTIONS: '@pending_actions',
  LAST_SYNC_TIME: '@last_sync_time',
};

// ---- PAGINATION ----
export const PAGE_LIMIT = 20;

// ---- THEME ----
export const COLORS = {
  background: '#000000',
  surface: 'rgba(255,255,255,0.08)',
  surfaceBorder: 'rgba(255,255,255,0.15)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.75)',
  textMuted: 'rgba(255,255,255,0.5)',
  accent: '#FF3040',
  accentGradientStart: '#FF3040',
  accentGradientEnd: '#FF5C8A',
  shimmer: 'rgba(255,255,255,0.06)',
  shimmerHighlight: 'rgba(255,255,255,0.14)',
};

export const SYNC_RETRY_LIMIT = 5;
export const SYNC_INTERVAL_MS = 15000;
