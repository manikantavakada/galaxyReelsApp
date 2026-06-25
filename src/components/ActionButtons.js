import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '../utils/constants';
import {formatCount} from '../utils/helpers';
import {HeartIcon, MoreIcon, ShareIcon} from './Icons';


const ActionButtons = React.memo(
  ({isLiked, likeCount, onLikePress, onSharePress, onMorePress}) => {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={onLikePress}
          activeOpacity={0.7}>
          <View style={styles.glassCircle}>
            <HeartIcon filled={isLiked} />
          </View>
          <Text style={styles.label}>{formatCount(likeCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onSharePress}
          activeOpacity={0.7}>
          <View style={styles.glassCircle}>
            <ShareIcon />
          </View>
          <Text style={styles.label}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onMorePress}
          activeOpacity={0.7}>
          <View style={styles.glassCircle}>
            <MoreIcon />
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 130,
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    marginBottom: 20,
  },
  glassCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
});

export default ActionButtons;
