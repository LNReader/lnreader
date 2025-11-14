import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';
import color from 'color';
import { ThemeColors } from '@theme/types';
import { Row } from '@components/Common';
import { borderColor } from '@theme/colors';

interface PagePaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpenDrawer: () => void;
  theme: ThemeColors;
}

const PagePaginationControl: React.FC<PagePaginationControlProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onOpenDrawer,
  theme,
}) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage !== 1) {
        pages.push(1);
      }

      const leftPage = currentPage - 1;
      if (leftPage > 1) {
        if (leftPage > 2) {
          pages.push('ellipsis');
        }
        pages.push(leftPage);
      }

      pages.push(currentPage);

      if (currentPage < totalPages - 1) {
        pages.push('ellipsis');
      }

      if (totalPages !== currentPage) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePagePress = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          styles.navButton,
          {
            borderColor: borderColor,
            backgroundColor: theme.surface,
          },
          !canGoPrevious && styles.disabledButton,
        ]}
        onPress={handlePrevious}
        disabled={!canGoPrevious}
        android_ripple={{ color: theme.rippleColor }}
      >
        <IconButton
          icon="chevron-left"
          iconColor={canGoPrevious ? theme.onSurface : theme.onSurfaceDisabled}
          size={20}
          style={styles.iconButton}
        />
      </Pressable>

      <Row style={styles.pageNumbersRow}>
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <Pressable
                key={`ellipsis-${index}`}
                style={[
                  styles.button,
                  styles.ellipsisButton,
                  {
                    borderColor: borderColor,
                    backgroundColor: theme.surface,
                  },
                ]}
                onPress={onOpenDrawer}
                android_ripple={{ color: theme.rippleColor }}
              >
                <Text style={[styles.ellipsisText, { color: theme.onSurface }]}>
                  ...
                </Text>
              </Pressable>
            );
          }

          const isActive = page === currentPage;
          return (
            <Pressable
              key={page}
              style={[
                styles.button,
                {
                  borderColor: isActive ? 'transparent' : borderColor,
                  backgroundColor: isActive ? theme.primary : theme.surface,
                },
              ]}
              onPress={() => handlePagePress(page)}
              android_ripple={{
                color: isActive
                  ? color(theme.onPrimary).alpha(0.2).string()
                  : theme.rippleColor,
              }}
            >
              <Text
                style={[
                  styles.pageText,
                  {
                    color: isActive ? theme.onPrimary : theme.onSurface,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
              >
                {page}
              </Text>
            </Pressable>
          );
        })}
      </Row>

      <Pressable
        style={[
          styles.button,
          styles.navButton,
          {
            borderColor: borderColor,
            backgroundColor: theme.surface,
          },
          !canGoNext && styles.disabledButton,
        ]}
        onPress={handleNext}
        disabled={!canGoNext}
        android_ripple={{ color: theme.rippleColor }}
      >
        <IconButton
          icon="chevron-right"
          iconColor={canGoNext ? theme.onSurface : theme.onSurfaceDisabled}
          size={20}
          style={styles.iconButton}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    minWidth: 40,
    paddingHorizontal: 12,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  ellipsisButton: {
    borderStyle: 'dashed',
  },
  ellipsisText: {
    fontSize: 16,
    fontWeight: '500',
  },
  iconButton: {
    margin: 0,
  },
  navButton: {
    paddingHorizontal: 0,
  },
  pageNumbersRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageText: {
    fontSize: 15,
    letterSpacing: 0.15,
  },
});

export default PagePaginationControl;
