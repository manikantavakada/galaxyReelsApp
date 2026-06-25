# ReelsApp — Instagram-style Reels Feed (React Native CLI)

Production-ready offline-first Reels feed: full-screen vertical video,
auto-play/pause, infinite pagination, double-tap like with optimistic UI,
and a background sync engine for offline likes.

## Stack

React Native CLI · JavaScript · React Navigation v7 · Redux Toolkit ·
Redux Persist · Axios · AsyncStorage · react-native-video ·
react-native-fast-image · react-native-reanimated ·
react-native-gesture-handler · @react-native-community/netinfo ·
@shopify/flash-list

## Setup

```bash
npm install

# iOS only
cd ios && pod install && cd ..
```

### Required native setup (do this before running)

**1. Gesture Handler** — `index.js` already imports
`react-native-gesture-handler` first. On Android, no extra step is needed
for RN ≥0.60. On iOS, this is covered by `pod install`.

**2. Reanimated** — `babel.config.js` already includes the
`react-native-reanimated/plugin` (must always be listed **last** in the
plugins array — it already is). Clear the Metro cache after first install:
```bash
npx react-native start --reset-cache
```

**3. react-native-video** — requires no extra linking on RN ≥0.60
(autolinked). If you hit a build error on Android about ExoPlayer,
confirm `android/build.gradle` has `minSdkVersion >= 21`.

**4. Permissions** — add network state permission for NetInfo on Android,
in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Run

```bash
npm run android
# or
npm run ios
```

## Architecture

```
src/
  api/            Axios client + per-endpoint request functions (tRPC GET/POST shapes)
  components/     Presentational, memoized UI pieces (ReelItem, VideoPlayer, ActionButtons, Loader, ErrorView)
  screens/        ReelsScreen — composition root for the feed
  navigation/      React Navigation v7 native-stack setup
  redux/          reelsSlice (feed/pagination/likes), syncSlice (offline queue), store (persisted)
  services/       NetworkService (NetInfo wrapper), OfflineSyncService (queue drain engine)
  storage/        AsyncStorage wrapper (used directly by redux-persist + any ad-hoc reads)
  hooks/          useReels (data orchestration), useOfflineSync (network wiring)
  utils/          constants, helpers (formatting, merge/dedupe, id generation)
```

### Data flow

1. `useReels` dispatches `loadReels` (an async thunk) on mount, on
   pull-to-refresh, and on scroll-end (pagination via `nextCursor`).
2. `reelsSlice` is persisted via `redux-persist` (`reels`, `nextCursor`,
   `hasLoadedOnce` whitelisted) — so on a cold start with no network, the
   last-seen feed renders immediately instead of a blank/error screen.
3. Liking a reel updates state optimistically in `reelsSlice`
   (`toggleLikeOptimistic`). If online, the real API call fires
   immediately; on failure it's rolled back (`revertLike`). If offline,
   the intent is queued into `syncSlice.pendingActions` instead — never
   blocking the UI.
4. `useOfflineSync` (mounted once at the app root) subscribes to NetInfo.
   On reconnect, it calls `runOfflineSync`, which drains
   `pendingActions` in chronological order, calling the real Like API for
   each, removing successes, retrying failures up to `SYNC_RETRY_LIMIT`,
   and dropping anything that still fails after that (so a single bad
   action can't wedge the queue forever). A 15s interval is also run as a
   safety net for missed reconnect events.
5. `pendingActions` is itself persisted, so a queued like survives an app
   restart and is retried the next time the device is online.

### Auto-play logic

`FlashList`'s `onViewableItemsChanged` (80% visibility threshold) drives
`activeIndex` in `ReelsScreen`. Each `ReelItem` receives `isActive`
(controls `paused` on the underlying `<Video>`) and `isVisible` (only
mounts the player within ±1 index of the active item, so far-off videos
don't hold decoder resources).

### Why no BlurView for glassmorphism

The action-rail "glass" look uses a semi-transparent background + hairline
border rather than a true blur, to avoid adding a dependency
(`@react-native-community/blur`) outside the tech stack specified in the
brief. Swap `ActionButtons`' `glassCircle` style for a `<BlurView>` if a
true frosted-glass blur is wanted later.

### Extension points left intentionally as no-ops

- `ReelsScreen.handleSharePress` / `handleMorePress` — wire up the native
  Share sheet and a report/bottom-sheet menu respectively once product
  defines the exact behavior.
- `ReelItem.handleSingleTap` — reserved for a future "tap to pause"
  gesture; currently a no-op so it doesn't fight the double-tap-to-like
  gesture.

## Notes on the provided API

The assignment's endpoints (`posts.getReels`, `social.toggleLike`) are
tRPC procedures. `reelsApi.js` sends the GET input as a JSON-encoded
`input` query param (the standard tRPC GET convention); `likeApi.js`
sends a plain JSON body for the POST mutation. Response unwrapping
defensively handles both the standard `{ result: { data } }` tRPC envelope
and a flat payload, in case the backend's exact response shape differs
from the tRPC default — adjust the unwrapping in those two files once you
confirm the live response shape against the real endpoint.

The bearer token is currently hardcoded in `src/utils/constants.js` to
match what was provided. Before shipping, move it to `react-native-config`
or an equivalent `.env` solution and never commit it.
