import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { getString } from '../../../../../strings/translations';
import { Button, IconButtonV2 } from '../../../../components';
import { ButtonVariation } from '../../../../components/Button/Button';

import { Source } from '../../../../sources/types';
import { coverPlaceholderColor } from '../../../../theme/colors';
import { ThemeType } from '../../../../theme/types';

interface Props {
  source: Source;
  isPinned: boolean;
  theme: ThemeType;
  onTogglePinSource: (sourceId: number) => void;
  navigateToSource: (source: Source) => void;
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
        <Text style={{ color: theme.textColorPrimary }}>
          {source.sourceName}
        </Text>
        <Text style={[{ color: theme.textColorSecondary }, styles.lang]}>
          {source.lang}
        </Text>
      </View>
    </View>
    <View style={styles.flexRow}>
      <Button
        title={getString('browse')}
        variation={ButtonVariation.CLEAR}
        textColor={theme.colorAccent}
        onPress={() => navigateToSource(source)}
        theme={theme}
      />
      <IconButtonV2
        name={isPinned ? 'pin' : 'pin-outline'}
        size={22}
        color={isPinned ? theme.colorAccent : theme.textColorSecondary}
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
