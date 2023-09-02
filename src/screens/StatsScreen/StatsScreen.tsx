import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { overlay } from 'react-native-paper';

import { Appbar, ErrorScreenV2, LoadingScreenV2 } from '@components';

import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
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

const StatsScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<LibraryStats>({});
  const [error, setError] = useState();

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

  if (isLoading) {
    return (
      <>
        {Header}
        <LoadingScreenV2 theme={theme} />
      </>
    );
  }

  if (error) {
    return (
      <>
        {Header}
        <ErrorScreenV2 error={error} />
      </>
    );
  }

  return (
    <>
      {Header}
      <ScrollView
        style={styles.screenCtn}
        contentContainerStyle={styles.contentCtn}
      >
        <Text style={[styles.header, { color: theme.onSurfaceVariant }]}>
          {getString('moreScreen.settingsScreen.generalSettings')}
        </Text>
        <View style={styles.statsGroupCtn}>
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
          <StatsCard
            label={getString('statsScreen.unreadChapters')}
            value={stats.chaptersUnread}
          />
          <StatsCard
            label={getString('statsScreen.downloadedChapters')}
            value={stats.chaptersDownloaded}
          />
          <StatsCard label="Sources" value={stats.sourcesCount} />
        </View>
        <Text style={[styles.header, { color: theme.onSurfaceVariant }]}>
          {getString('statsScreen.genreDistribution')}
        </Text>

        <View style={styles.statsGroupCtn}>
          {Object.entries(stats.genres || {}).map(item => (
            <StatsCard key={item[0]} label={item[0]} value={item[1]} />
          ))}
        </View>
        <Text style={[styles.header, { color: theme.onSurfaceVariant }]}>
          {getString('statsScreen.statusDistribution')}
        </Text>
        <View style={styles.statsGroupCtn}>
          {Object.entries(stats.status || {}).map(item => (
            <StatsCard key={item[0]} label={item[0]} value={item[1]} />
          ))}
        </View>
      </ScrollView>
    </>
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
  statsGroupCtn: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardCtn: {
    elevation: 1,
    margin: 4,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsVal: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  screenCtn: {
    paddingHorizontal: 16,
  },
  contentCtn: {
    paddingBottom: 40,
  },

  genreRow: {
    flexWrap: 'wrap',
  },
  header: {
    paddingVertical: 16,
    fontWeight: 'bold',
  },
});
