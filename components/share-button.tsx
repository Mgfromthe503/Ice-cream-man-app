import React from 'react';
import { Pressable, Text, View, Alert } from 'react-native';
import { useColors } from '@/hooks/use-colors';

// Try to import optional modules
let Sharing: any = null;
let Clipboard: any = null;

try {
  Sharing = require('expo-sharing');
} catch (e) {
  // Module not available
}

try {
  Clipboard = require('expo-clipboard');
} catch (e) {
  // Module not available
}

interface ShareButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onShare?: () => void;
}

export function ShareButton({
  variant = 'primary',
  size = 'medium',
  showLabel = true,
  onShare,
}: ShareButtonProps) {
  const colors = useColors();

  const handleShare = async () => {
    try {
      const appStoreUrl = 'https://play.google.com/store/apps/details?id=space.manus.the.ice.cream.man';
      const message = `🍦 Download The Ice Cream Man! Order ice cream to your neighborhood with one tap.\n\nGet it on Google Play:\n${appStoreUrl}`;

      if (Sharing && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(message, {
          dialogTitle: 'Share The Ice Cream Man',
          mimeType: 'text/plain',
        });
      } else if (Clipboard) {
        // Fallback: Copy to clipboard
        await Clipboard.setStringAsync(message);
        Alert.alert('Copied!', 'App link copied to clipboard. Share it with your friends!');
      } else {
        Alert.alert('Share', 'Share The Ice Cream Man with your friends!');
      }

      if (onShare) {
        onShare();
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert('Error', 'Failed to share app. Please try again.');
    }
  };

  const sizeClasses = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4',
  };

  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-surface border border-border',
    minimal: 'bg-transparent',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <Pressable
      onPress={handleShare}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <View className={`rounded-lg flex-row items-center justify-center gap-2 ${sizeClasses[size]} ${variantClasses[variant]}`}>
        <Text className="text-xl">📤</Text>
        {showLabel && (
          <Text className={`font-semibold ${textSizeClasses[size]} ${variant === 'primary' ? 'text-white' : 'text-foreground'}`}>
            Share
          </Text>
        )}
      </View>
    </Pressable>
  );
}
