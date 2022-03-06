import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { ThemeType } from '../../theme/types';

interface UnreadBadgeProps {
  unreadCount: number;
  downloadCount: number;
  showDownloadsBadge: boolean;
  theme: ThemeType;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({
  unreadCount,
  downloadCount,
  showDownloadsBadge,
  theme,
}) => (
  <Text
    style={[
      styles.unreadBadge,
      (!downloadCount || !showDownloadsBadge) && styles.borderLeftRadius,
      { backgroundColor: theme.primary, color: theme.onPrimary },
    ]}
  >
    {unreadCount}
  </Text>
);

interface DownloadsBadgeProps {
  unreadCount: number;
  downloadCount: number;
  showUnreadBadge: boolean;
  theme: ThemeType;
}

const DownloadsBadge: React.FC<DownloadsBadgeProps> = ({
  unreadCount,
  downloadCount,
  showUnreadBadge,
  theme,
}) => (
  <Text
    style={[
      styles.downloadBadge,
      (!unreadCount || !showUnreadBadge) && styles.borderRightRadius,
      { backgroundColor: theme.tertiary, color: theme.onTertiary },
    ]}
  >
    {downloadCount}
  </Text>
);

interface InLibraryBadgeProps {
  theme: ThemeType;
}

const InLibraryBadge: React.FC<InLibraryBadgeProps> = ({ theme }) => (
  <Text
    style={[
      styles.inLibraryBadge,
      { backgroundColor: theme.primary, color: theme.onPrimary },
    ]}
  >
    In library
  </Text>
);

export { UnreadBadge, DownloadsBadge, InLibraryBadge };

const styles = StyleSheet.create({
  borderLeftRadius: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  borderRightRadius: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  unreadBadge: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  downloadBadge: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  inLibraryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 12,
    zIndex: 2,
  },
});
