import apiClient from './apiClient';
import {ENDPOINTS, PAGE_LIMIT} from '../utils/constants';
import {logDebug} from '../utils/logger';
import {normalizeReels} from '../utils/reelNormalizer';

/**
 * Fetches a page of reels.
 * tRPC GET procedures expect the input as a URL-encoded JSON string under
 * the `input` query param: ?input={"limit":20,"cursor":"..."}
 *
 * @param {string|null} cursor - pagination cursor, null/undefined for first page
 * @param {number} limit
 */
export const fetchReels = async (cursor = '', limit = PAGE_LIMIT) => {
  const input = JSON.stringify({limit, cursor: cursor || ''});

  logDebug('ReelsApi', 'fetchReels start', {
    cursor: cursor || '',
    limit,
    endpoint: ENDPOINTS.GET_REELS,
  });

  const response = await apiClient.get(ENDPOINTS.GET_REELS, {
    params: {input},
  });


  const payload = response?.data?.result?.data ?? response?.data ?? {};
  const rawReels = payload.reels || payload.items || payload.data || [];
  const reels = normalizeReels(rawReels);
  const nextCursor = payload.nextCursor ?? payload.cursor ?? null;

  logDebug('ReelsApi', 'fetchReels payload summary', {
    responseKeys:
      response?.data && typeof response.data === 'object'
        ? Object.keys(response.data)
        : typeof response?.data,
    payloadKeys:
      payload && typeof payload === 'object' ? Object.keys(payload) : typeof payload,
    rawReelCount: Array.isArray(rawReels) ? rawReels.length : null,
    reelCount: reels.length,
    reelsType: Array.isArray(rawReels) ? 'array' : typeof rawReels,
    nextCursor,
    firstRawReel: Array.isArray(rawReels) && rawReels.length ? rawReels[0] : null,
    firstNormalizedReel: reels.length
      ? {
          id: reels[0].id,
          username: reels[0].username,
          videoUrl: reels[0].videoUrl,
          thumbnailUrl: reels[0].thumbnailUrl,
          profileImageUrl: reels[0].profileImageUrl,
          likeCount: reels[0].likeCount,
        }
      : null,
  });

  return {
    reels,
    nextCursor,
  };
};

export default fetchReels;
