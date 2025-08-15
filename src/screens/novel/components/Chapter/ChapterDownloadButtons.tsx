import React, { memo, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Menu, overlay } from 'react-native-paper';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import Color from 'color';
import { getString } from '@strings/translations';
import type { MD3ThemeType } from '@theme/types';

export interface DownloadButtonProps {
  status: 'idle' | 'downloading' | 'downloaded';
  theme: MD3ThemeType;
  onDelete: () => void;
  onDownload: () => void;
  // Optional: Add progress for a progress bar if desired
  // progress?: number; // 0-100
}

const _DownloadButton: React.FC<DownloadButtonProps> = ({
  status,
  theme,
  onDelete,
  onDownload,
  // progress,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const rippleColor = useMemo(
    () => Color(theme.primary).alpha(0.12).string(),
    [theme.primary],
  );

  const menuContentStyle = useMemo(
    () => ({ backgroundColor: overlay(2, theme.surface) }),
    [theme.surface],
  );

  if (status === 'downloading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          color={theme.outline}
          size={25}
          style={styles.activityIndicator}
        />
      </View>
    );
  }

  if (status === 'downloaded') {
    return (
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <View style={styles.container}>
            <Pressable
              style={styles.pressable}
              onPress={() => setMenuVisible(true)}
              android_ripple={{ color: rippleColor }}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={25}
                color={theme.onSurface}
              />
            </Pressable>
          </View>
        }
        contentStyle={menuContentStyle}
      >
        <Menu.Item
          onPress={() => {
            onDelete();
            setMenuVisible(false);
          }}
          title={getString('common.delete')}
          titleStyle={{ color: theme.onSurface }}
        />
      </Menu>
    );
  }

  // status === 'idle' or 'error'
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.pressable}
        onPress={onDownload}
        android_ripple={{ color: rippleColor }}
      >
        <MaterialCommunityIcons
          name="arrow-down-circle-outline"
          size={25}
          color={theme.outline}
        />
      </Pressable>
    </View>
  );
};

function areEqualDownloadButton(
  prev: DownloadButtonProps,
  next: DownloadButtonProps,
) {
  return (
    prev.status === next.status &&
    // prev.progress === next.progress && // if you add progress prop
    prev.theme.primary === next.theme.primary &&
    prev.theme.onSurface === next.theme.onSurface &&
    prev.theme.outline === next.theme.outline &&
    prev.theme.surface === next.theme.surface && // for menu overlay
    prev.onDelete === next.onDelete &&
    prev.onDownload === next.onDownload
  );
}

export const DownloadButton = memo(_DownloadButton, areEqualDownloadButton);

const styles = StyleSheet.create({
  activityIndicator: { margin: 3.5, padding: 5 },
  container: {
    borderRadius: 50,
    width: 40,
    height: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
