import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { getString } from '@strings/translations';
import { Button } from '@components';

import { ThemeColors } from '@theme/types';

interface Props {
  trackerName: string;
  icon: ImageSourcePropType;
  onPress: () => void;
  theme: ThemeColors;
}

const DiscoverCard: React.FC<Props> = ({
  theme,
  icon,
  trackerName,
  onPress,
}) => {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      android_ripple={{ color: theme.rippleColor }}
    >
      <View style={styles.flexRow}>
        <Image source={icon} style={styles.icon} />
        <View style={styles.details}>
          <Text style={{ color: theme.onSurface }}>{trackerName}</Text>
        </View>
      </View>
      <View style={styles.flexRow}>
        <Button
          title={getString('browse')}
          textColor={theme.primary}
          onPress={onPress}
        />
      </View>
    </Pressable>
  );
};

export default DiscoverCard;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 12,
  },
  details: {
    marginLeft: 16,
  },
  flexRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    borderRadius: 4,
    height: 40,
    width: 40,
  },
});
