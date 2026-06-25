export const pickVideoUrl = reel => {
  const readyPlayback = Array.isArray(reel.videoPlayback)
    ? reel.videoPlayback.find(item => item?.status === 'READY' && item?.mp4Url)
    : null;

  return (
    readyPlayback?.mp4Url ||
    readyPlayback?.hlsUrl ||
    reel.videoUrl ||
    reel.video ||
    (Array.isArray(reel.videos) ? reel.videos.find(Boolean) : '') ||
    ''
  );
};

export const normalizeLocalVideoUrl = url => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `file://${url}`;
  }

  return url;
};

export const pickLocalVideoUrl = reel =>
  normalizeLocalVideoUrl(
    reel.localVideoUrl ||
      reel.localVideoUri ||
      reel.localUri ||
      reel.localUrl ||
      reel.offlineVideoUrl ||
      reel.offlineVideoUri ||
      reel.cachedVideoUrl ||
      reel.cachedVideoUri ||
      reel.cachedPath ||
      reel.cachePath ||
      reel.fileUri ||
      reel.fileUrl ||
      reel.filePath ||
      reel.videoPath ||
      '',
  );

export const pickPlayableVideoUrl = (reel, isOffline = false) => {
  const localVideoUrl = pickLocalVideoUrl(reel);
  if (isOffline) {
    return localVideoUrl || pickVideoUrl(reel);
  }
  return pickVideoUrl(reel) || localVideoUrl;
};

export const normalizeReel = reel => ({
  ...reel,
  id: reel.id,
  username:
    reel.username ||
    reel.authorUsername ||
    reel.authorName ||
    reel.author ||
    'Unknown',
  profileImageUrl:
    reel.profileImageUrl || reel.authorImage || reel.avatar || reel.userImage || '',
  videoUrl: pickVideoUrl(reel),
  localVideoUrl: pickLocalVideoUrl(reel),
  thumbnailUrl:
    reel.thumbnailUrl ||
    reel.videoThumbnail ||
    (Array.isArray(reel.videoPlayback)
      ? reel.videoPlayback.find(item => item?.thumbnailUrl)?.thumbnailUrl
      : '') ||
    '',
  likeCount:
    typeof reel.likeCount === 'number'
      ? reel.likeCount
      : Number(reel.likes || reel.like_count || 0),
  isLiked: Boolean(reel.isLiked),
  musicTitle: reel.musicTitle || reel.audioName || reel.audio || '',
  hashtags: Array.isArray(reel.hashtags) ? reel.hashtags : [],
  caption: reel.caption || '',
});

export const normalizeReels = reels =>
  Array.isArray(reels) ? reels.map(normalizeReel) : [];

export const hasMissingVideoUrls = reels =>
  Array.isArray(reels) && reels.some(reel => !pickVideoUrl(reel));
