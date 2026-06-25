
export const generateLocalId = () =>
  `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;


export const formatCount = count => {
  const n = Number(count) || 0;
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${n}`;
};

export const mergeUniqueById = (existing = [], incoming = []) => {
  const map = new Map();
  existing.forEach(item => map.set(item.id, item));
  incoming.forEach(item => map.set(item.id, item));
  return Array.from(map.values());
};

/**
 * Applies any still-pending offline like/unlike actions on top of a
 * freshly fetched reels list so the UI doesn't flicker back to a stale
 * server-side like state while a sync is still in flight.
 */
export const applyPendingActionsToReels = (reels = [], pendingActions = []) => {
  if (!pendingActions.length) return reels;

  const latestActionByPost = new Map();
  pendingActions.forEach(action => {
    const prev = latestActionByPost.get(action.postId);
    if (!prev || action.timestamp >= prev.timestamp) {
      latestActionByPost.set(action.postId, action);
    }
  });

  return reels.map(reel => {
    const pending = latestActionByPost.get(reel.id);
    if (!pending) return reel;
    const isLiked = pending.action === 'like';
    if (reel.isLiked === isLiked) return reel;
    return {
      ...reel,
      isLiked,
      likeCount: isLiked
        ? reel.likeCount + 1
        : Math.max(0, reel.likeCount - 1),
    };
  });
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
