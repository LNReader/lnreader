import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import color from 'color';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@providers/Providers';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';

interface NovelPaginationProps {
  page?: string;
  pages: string[];
  pageIndex: number;
  totalPages?: number;
  totalChapters?: number;
  onPageChange: (index: number) => void;
  onRefreshPage?: (page: string) => void;
  onFilterPress?: () => void;
}

const NovelPagination: React.FC<NovelPaginationProps> = ({
  page,
  pages,
  pageIndex,
  totalPages,
  totalChapters,
  onPageChange,
  onRefreshPage,
  onFilterPress,
}) => {
  const theme = useTheme();
  const [showPageModal, setShowPageModal] = useState(false);

  const handlePaginationPress = useCallback(() => {
    if ((totalPages ?? 0) > 1 || pages.length > 1) {
      setShowPageModal(true);
    }
  }, [totalPages, pages.length]);

  const closeModal = useCallback(() => {
    setShowPageModal(false);
  }, []);

  const handlePageSelect = useCallback(
    (index: number) => {
      onPageChange(index);
      // Modal will handle closing with animation
    },
    [onPageChange],
  );

  let chapterText = '';
  if (totalChapters !== undefined) {
    chapterText = `${totalChapters} ${getString('novelScreen.chapters')}`;
  } else {
    chapterText = getString('common.loading');
  }

  return (
    <>
      <Pressable
        style={styles.bottomsheet}
        onPress={handlePaginationPress}
        android_ripple={{
          color: color(theme.primary).alpha(0.12).string(),
        }}
      >
        <View style={styles.flex}>
          {(totalPages ?? 0) > 1 || pages.length > 1 ? (
            <Text
              numberOfLines={1}
              style={[{ color: theme.onSurface }, styles.pageTitle]}
            >
              Page: {page || pages[pageIndex] || '1'}
            </Text>
          ) : null}

          <Text style={[{ color: theme.onSurface }, styles.chapters]}>
            {chapterText}
          </Text>
        </View>
        {page && onRefreshPage ? (
          <IconButton
            icon="reload"
            iconColor={theme.onSurface}
            size={24}
            onPress={() => onRefreshPage(page)}
          />
        ) : null}
        <IconButton
          icon="filter-variant"
          iconColor={theme.onSurface}
          size={24}
          onPress={onFilterPress}
        />
      </Pressable>

      {showPageModal && (
        <PageSelectionModal
          pages={pages}
          currentPageIndex={pageIndex}
          onPageSelect={handlePageSelect}
          onClose={closeModal}
          theme={theme}
        />
      )}
    </>
  );
};

interface PageSelectionModalProps {
  pages: string[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onClose: () => void;
  theme: ThemeColors;
}

const PageSelectionModal: React.FC<PageSelectionModalProps> = ({
  pages,
  currentPageIndex,
  onPageSelect,
  onClose,
  theme,
}) => {
  const translateY = useSharedValue(40); // Start 40px below final position (more movement)
  const opacity = useSharedValue(0); // Start with opacity 0
  const backdropOpacity = useSharedValue(0); // Backdrop opacity
  const [isVisible, setIsVisible] = useState(false);

  // Custom animation style with translate and opacity
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Backdrop animation style
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Handle modal opening
  useEffect(() => {
    setIsVisible(true);
    translateY.value = withTiming(0, { duration: 300 }); // Slide up to final position
    opacity.value = withTiming(1, { duration: 250 }); // Fade in
    backdropOpacity.value = withTiming(1, { duration: 150 }); // Backdrop fade in
  }, [translateY, opacity, backdropOpacity]);

  // Handle modal closing
  const handleClose = useCallback(() => {
    // Start exit animations
    translateY.value = withTiming(40, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 }); // Fade out
    backdropOpacity.value = withTiming(0, { duration: 150 }); // Backdrop fade out
    // Close after animations complete (max duration 250ms)
    const timeout = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 260);
    return () => clearTimeout(timeout);
  }, [translateY, opacity, backdropOpacity, onClose]);

  // Handle page selection
  const handlePageSelect = useCallback(
    (index: number) => {
      // Update page immediately so UI reflects the change
      onPageSelect(index);
      // Start exit animations
      translateY.value = withTiming(40, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 }); // Fade out
      backdropOpacity.value = withTiming(0, { duration: 150 }); // Backdrop fade out
      // Close after animations complete
      const timeout = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 260);
      return () => clearTimeout(timeout);
    },
    [onPageSelect, translateY, opacity, backdropOpacity, onClose],
  );

  if (!isVisible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.modalOverlay]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.modalBackdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.modalContent,
          { backgroundColor: theme.surface },
          animatedStyle,
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          Pages
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {pages.map((pageName, index) => {
            const isSelected = index === currentPageIndex;
            const backgroundColor = isSelected
              ? color(theme.primary).alpha(0.12).string()
              : 'transparent';

            return (
              <Pressable
                key={pageName}
                style={[styles.pageListItem, { backgroundColor }]}
                onPress={() => handlePageSelect(index)}
                android_ripple={{ color: theme.rippleColor }}
              >
                <Text
                  style={[
                    styles.pageListItemText,
                    {
                      color: isSelected ? theme.primary : theme.onSurface,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {pageName}
                </Text>
                {isSelected && (
                  <View
                    style={[
                      styles.currentIndicator,
                      { backgroundColor: theme.primary },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomsheet: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 12,
    paddingVertical: 4,
  },
  chapters: {
    fontSize: 14,
    paddingHorizontal: 16,
  },
  currentIndicator: {
    borderRadius: 2,
    height: 4,
    width: 24,
  },
  flex: { flex: 1 },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalOverlay: {
    justifyContent: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pageListItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pageListItemText: {
    flex: 1,
    fontSize: 16,
  },
  pageTitle: {
    fontSize: 16,
    paddingHorizontal: 16,
  },
});

export default NovelPagination;
