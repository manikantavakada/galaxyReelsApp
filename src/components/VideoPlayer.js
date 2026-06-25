import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import Video from 'react-native-video';
import {COLORS} from '../utils/constants';
import {logDebug, logError} from '../utils/logger';

const {width, height} = Dimensions.get('window');
const VIDEO_CACHE_SIZE_MB = 512;


const VideoPlayer = React.memo(({uri, isActive, isVisible, onLoad}) => {
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    logDebug('VideoPlayer', 'source changed', {
      uri,
      hasUri: Boolean(uri),
      isLocalSource: typeof uri === 'string' && uri.startsWith('file://'),
      isActive,
      isVisible,
    });
  }, [isActive, isVisible, uri]);

  const handleLoad = useCallback(() => {
    setIsBuffering(false);
    logDebug('VideoPlayer', 'loaded', {uri});
    onLoad && onLoad();
  }, [onLoad, uri]);

  const handleBuffer = useCallback(({isBuffering: buffering}) => {
    setIsBuffering(buffering);
    logDebug('VideoPlayer', 'buffer state', {uri, isBuffering: buffering});
  }, [uri]);

  const handleError = useCallback(
    error => {
      logError('VideoPlayer', 'video failed to load', {
        uri,
        error,
      });
    },
    [uri],
  );

  if (!uri) {
    logDebug('VideoPlayer', 'empty video uri received');
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Video source missing</Text>
      </View>
    );
  }

  if (!isVisible) {
    return <View style={styles.placeholder} />;
  }

  return (
    <View style={styles.container}>
      <Video
        source={{uri}}
        style={styles.video}
        resizeMode="cover"
        repeat
        paused={!isActive}
        muted={false}
        playInBackground={false}
        playWhenInactive={false}
        onLoad={handleLoad}
        onBuffer={handleBuffer}
        onError={handleError}
        bufferConfig={{
          minBufferMs: 5000,
          maxBufferMs: 20000,
          bufferForPlaybackMs: 1000,
          bufferForPlaybackAfterRebufferMs: 1500,
          cacheSizeMB: VIDEO_CACHE_SIZE_MB,
        }}
        ignoreSilentSwitch="obey"
      />
      {isBuffering && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="large" color={COLORS.text} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: COLORS.background,
  },
  placeholder: {
    width,
    height,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  video: {
    width,
    height,
  },
  bufferingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VideoPlayer;
