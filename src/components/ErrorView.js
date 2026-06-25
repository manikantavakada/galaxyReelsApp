import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '../utils/constants';


const ErrorView = ({
  variant = 'error', // 'error' | 'empty'
  message,
  onRetry,
}) => {
  const isEmpty = variant === 'empty';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{isEmpty ? 'REELS' : '!'}</Text>
      <Text style={styles.title}>
        {isEmpty ? 'No reels yet' : 'Something went wrong'}
      </Text>
      <Text style={styles.message}>
        {message ||
          (isEmpty
            ? "New reels will show up here once they're available."
            : "We couldn't load reels right now. Check your connection and try again.")}
      </Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
  },
  retryText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ErrorView;
