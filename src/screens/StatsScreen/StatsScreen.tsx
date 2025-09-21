import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@providers/Providers';
import { getString } from '@strings/translations';

import {
  Appbar,
  ErrorScreenV2,
  LoadingScreenV2,
  SafeAreaView,
} from '@components';

import { LibraryStats } from '@database/types';
import {
  getChaptersDownloadedCountFromDb,
  getChaptersReadCountFromDb,
  getChaptersTotalCountFromDb,
  getChaptersUnreadCountFromDb,
  getLibraryStatsFromDb,
  getNovelGenresFromDb,
  getNovelStatusFromDb,
} from '@database/queries/StatsQueries';
import { Row } from '@components/Common';
import { overlay } from 'react-native-paper';
import { translateNovelStatus } from '@utils/translateEnum';

const StatsScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<LibraryStats>({});
  const [error, setError] = useState<any>();

  const getStats = async () => {
    try {
      const res = await Promise.all([
        getLibraryStatsFromDb(),
        getChaptersTotalCountFromDb(),
        getChaptersReadCountFromDb(),
        getChaptersUnreadCountFromDb(),
        getChaptersDownloadedCountFromDb(),
        getNovelGenresFromDb(),
        getNovelStatusFromDb(),
      ]);
      setStats(Object.assign(...res));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  const Header = (
    <Appbar
      title={getString('statsScreen.title')}
      handleGoBack={goBack}
      theme={theme}
    />
  );

  if (error) {
    return (
      <>
        {Header}
        <ErrorScreenV2 error={error} />
      </>
    );
  }
  if (isLoading) {
    return (
      <>
        {Header}
        <LoadingScreenV2 theme={theme} />
      </>
    );
  }

  return (
    <SafeAreaView excludeTop>
      {Header}
      <ScrollView
        style={styles.screenCtn}
        contentContainerStyle={styles.contentCtn}
      >
        <Text style={[styles.header, { color: theme.onSurfaceVariant }]}>
          {getString('generalSettings')}
        </Text>
        <Row style={styles.statsRow}>
          <StatsCard
            label={getString('statsScreen.titlesInLibrary')}
            value={stats.novelsCount}
          />
          <StatsCard
            label={getString('statsScreen.readChapters')}
            value={stats.chaptersRead}
          />
          <StatsCard
            label={getString('statsScreen.totalChapters')}
            value={stats.chaptersCount}
          />
        </Row>
        <Row style={styles.statsRow}>
          <StatsCard
            label={getString('statsScreen.unreadChapters')}
            value={stats.chaptersUnread}
          />
          <StatsCard
            label={getString('statsScreen.downloadedChapters')}
            value={stats.chaptersDownloaded}
          />
        </Row>
        <Row style={styles.statsRow}>
          <StatsCard
            label={getString('statsScreen.sources')}
            value={stats.sourcesCount}
          />
        </Row>
        <Text style={[styles.header, { color: theme.onSurfaceVariant }]}>
          {getString('statsScreen.genreDistribution')}
        </Text>
        <Row style={[styles.statsRow, styles.genreRow]}>
          {Object.entries(stats.genres || {}).map(item => (
            <StatsCard key={item[0]} label={item[0]} value={item[1]} />
          ))}
        </Row>
        <Text style={[styles.header, { color: theme.onSurfaceVariant }]}>
          {getString('statsScreen.statusDistribution')}
        </Text>
        <Row style={[styles.statsRow, styles.genreRow]}>
          {Object.entries(stats.status || {}).map(item => (
            <StatsCard
              key={item[0]}
              label={translateNovelStatus(item[0])}
              value={item[1]}
            />
          ))}
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsScreen;

export const StatsCard: React.FC<{ label: string; value?: number }> = ({
  label,
  value = 0,
}) => {
  const theme = useTheme();

  if (!label) {
    return null;
  }

  return (
    <View
      style={[
        styles.statsCardCtn,
        {
          backgroundColor: theme.isDark
            ? overlay(2, theme.surface)
            : theme.secondaryContainer,
        },
      ]}
    >
      <Text style={[styles.statsVal, { color: theme.primary }]}>{value}</Text>
      <Text style={{ color: theme.onSurface }}> {label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contentCtn: {
    paddingBottom: 40,
  },
  genreRow: {
    flexWrap: 'wrap',
  },
  header: {
    fontWeight: 'bold',
    paddingVertical: 16,
  },
  screenCtn: {
    paddingHorizontal: 16,
  },
  statsCardCtn: {
    alignItems: 'center',
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    margin: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  statsRow: {
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
