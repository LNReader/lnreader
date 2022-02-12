import React, {ReactNode} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';

import {NovelScreenBackdrop, NovelScreenButtonGroup, NovelSummary} from '..';
import {Chip} from '../../../../components';

import {ChapterItem, NovelInfo} from '../../../../database/types';
import {ThemeType} from '../../../../theme/types';

const NovelCover: React.FC<{coverUri?: string}> = ({coverUri}) => (
  <FastImage source={{uri: coverUri}} style={styles.novelCover} />
);

const InfoText: React.FC<{
  color?: string;
  fontSize?: number;
  children: ReactNode;
  numberOfLines?: number;
}> = ({color, fontSize, numberOfLines, children}) => (
  <Text
    style={[{color, fontSize}, styles.infoText]}
    numberOfLines={numberOfLines || 1}
  >
    {children}
  </Text>
);

interface NovelScreenHeaderProps {
  novel: NovelInfo | null;
  chapters: ChapterItem[] | null;
  theme: ThemeType;
}

const NovelScreenHeader: React.FC<NovelScreenHeaderProps> = ({
  novel,
  chapters,
  theme,
}) => {
  const titleColor = theme.textColorPrimary;
  const infoColor = theme.textColorSecondary;

  const genres = novel?.genre?.split(',');

  return (
    <>
      <NovelScreenBackdrop coverUri={novel?.novelCover} theme={theme}>
        <NovelCover coverUri={novel?.novelCover} />
        <View style={styles.novelInfoContainer}>
          <InfoText color={titleColor} fontSize={18} numberOfLines={2}>
            {novel?.novelName}
          </InfoText>
          <InfoText color={infoColor}>{novel?.author}</InfoText>
          <InfoText
            color={infoColor}
            fontSize={14}
          >{`${novel?.status} • ${novel?.source}`}</InfoText>
        </View>
      </NovelScreenBackdrop>
      <NovelScreenButtonGroup novel={novel} theme={theme} />
      {novel?.novelSummary ? (
        <NovelSummary
          summary={novel?.novelSummary}
          isExpanded={Boolean(novel.followed)}
          theme={theme}
        />
      ) : null}
      {genres ? (
        <FlatList
          contentContainerStyle={styles.genresContainer}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={genres}
          keyExtractor={item => item}
          renderItem={({item}) => <Chip label={item} theme={theme} />}
        />
      ) : null}
      <Pressable
        style={styles.chapterListHeader}
        android_ripple={{color: theme.rippleColor}}
      >
        <Text
          style={[styles.chapterLength, {color: titleColor}]}
        >{`${chapters?.length} chapters`}</Text>
      </Pressable>
    </>
  );
};

export default NovelScreenHeader;

const styles = StyleSheet.create({
  novelCover: {
    height: 150,
    width: 100,
    borderRadius: 6,
  },
  novelInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  infoText: {
    marginVertical: 2,
  },
  genresContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  chapterListHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chapterLength: {
    fontSize: 16,
  },
});
