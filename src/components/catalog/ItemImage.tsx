import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { AssetImage } from '@/types';

interface ItemImageProps {
  image?: AssetImage | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ItemImage: React.FC<ItemImageProps> = ({
  image,
  style,
  containerStyle,
}) => {
  const [hasError, setHasError] = useState(false);

  // Priority: thumbnail_url > preview_url > url
  const sourceUrl =
    image?.thumbnail_url || image?.preview_url || image?.url;

  const showPlaceholder = !sourceUrl || hasError;

  return (
    <View style={[styles.container, containerStyle]}>
      {showPlaceholder ? (
        <View style={[styles.placeholder, style]}>
          <View style={styles.placeholderIcon} />
        </View>
      ) : (
        <Image
          source={{ uri: sourceUrl }}
          style={[styles.image, style]}
          contentFit="cover"
          transition={200}
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
});
