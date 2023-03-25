import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';

import { getString } from '../../../../../strings/translations';
import { Button, IconButtonV2 } from '../../../../components';

import { Source } from '../../../../sources/types';
import { coverPlaceholderColor } from '../../../../theme/colors';
import { ThemeColors } from '../../../../theme/types';

interface Props {
  source: Source;
  isPinned: boolean;
  theme: ThemeColors;
  onTogglePinSource: (sourceId: number) => void;
  navigateToSource: (source: Source, showLatestNovels?: boolean) => void;
}

const SourceCard: React.FC<Props> = ({
  source,
  isPinned,
  navigateToSource,
  onTogglePinSource,
  theme,
}) => (
  <Pressable
    style={styles.container}
    onPress={() => navigateToSource(source)}
    android_ripple={{ color: theme.rippleColor }}
  >
    <View style={styles.flexRow}>
      <Image source={{ uri: source.icon }} style={styles.icon} />
      <View style={styles.details}>
        <Text style={{ color: theme.onSurface }}>{source.sourceName}</Text>
        <Text style={[{ color: theme.onSurfaceVariant }, styles.lang]}>
          {source.lang}
        </Text>
      </View>
    </View>
    <View style={styles.flexRow}>
      <Button
        title={getString('browseScreen.latest')}
        textColor={theme.primary}
        onPress={() => navigateToSource(source, true)}
      />
      <IconButtonV2
        name={isPinned ? 'pin' : 'pin-outline'}
        size={22}
        color={isPinned ? theme.primary : theme.onSurfaceVariant}
        onPress={() => onTogglePinSource(source.sourceId)}
        theme={theme}
      />
    </View>
  </Pressable>
);

export default SourceCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 12,
  },
  icon: {
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  details: {
    marginLeft: 16,
  },
  lang: {
    fontSize: 12,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
