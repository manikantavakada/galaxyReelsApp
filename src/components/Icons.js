import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../utils/constants';

export const HeartIcon = ({filled = false}) => (
  <Text style={[styles.heart, filled && styles.heartFilled]}>
    {filled ? '♥' : '♡'}
  </Text>
);

export const MoreIcon = () => (
  <View style={styles.moreIcon}>
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
  </View>
);

export const ShareIcon = () => (
  <View style={styles.shareIcon}>
    <View style={[styles.shareNode, styles.shareTop]} />
    <View style={[styles.shareNode, styles.shareMiddle]} />
    <View style={[styles.shareNode, styles.shareBottom]} />
    <View style={[styles.shareLine, styles.shareLineTop]} />
    <View style={[styles.shareLine, styles.shareLineBottom]} />
  </View>
);

export const PlayIcon = () => <View style={styles.playIcon} />;

export const PauseIcon = () => (
  <View style={styles.pauseIcon}>
    <View style={styles.pauseBar} />
    <View style={styles.pauseBar} />
  </View>
);

const styles = StyleSheet.create({
  heart: {
    color: COLORS.text,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 34,
  },
  heartFilled: {
    color: COLORS.accent,
  },
  moreIcon: {
    width: 28,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.text,
  },
  shareIcon: {
    width: 30,
    height: 30,
  },
  shareNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
  },
  shareTop: {
    top: 4,
    right: 3,
  },
  shareMiddle: {
    top: 12,
    left: 3,
  },
  shareBottom: {
    bottom: 4,
    right: 3,
  },
  shareLine: {
    position: 'absolute',
    left: 10,
    width: 15,
    height: 2,
    backgroundColor: COLORS.text,
    borderRadius: 1,
  },
  shareLineTop: {
    top: 10,
    transform: [{rotate: '-24deg'}],
  },
  shareLineBottom: {
    bottom: 10,
    transform: [{rotate: '24deg'}],
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftWidth: 23,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: COLORS.text,
    marginLeft: 4,
  },
  pauseIcon: {
    width: 26,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseBar: {
    width: 8,
    height: 30,
    borderRadius: 2,
    backgroundColor: COLORS.text,
  },
});
