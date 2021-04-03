import React, { useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    RefreshControl,
    ToastAndroid,
} from "react-native";
import { Provider, Portal } from "react-native-paper";

import ChapterCard from "./components/ChapterCard";
import NovelInfoHeader from "./components/NovelHeader";
import { BottomSheet } from "./components/BottomSheet";

import { connect } from "react-redux";

import {
    getNovelAction,
    followNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
} from "../../redux/novel/novel.actions";

const Novel = ({
    route,
    theme,
    novel,
    chapters,
    loading,
    getNovelAction,
    fetching,
    followNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
}) => {
    const {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
        followed,
        novelId,
    } = route.params;

    let _panel = useRef(null); // Bottomsheet ref

    useEffect(() => {
        getNovelAction(followed, sourceId, novelUrl, novelId);
    }, [getNovelAction]);

    let lastRead = !loading && chapters.find((obj) => obj.read === 0);

    const renderChapterCard = ({ item }) => (
        <ChapterCard
            novelUrl={novelUrl}
            extensionId={sourceId}
            chapter={item}
        />
    );

    const onRefresh = () => {
        updateNovelAction(sourceId, novelUrl, novelId);
        ToastAndroid.show(`Updated ${novelName}`, ToastAndroid.SHORT);
    };

    return (
        <Provider>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <FlatList
                    data={!loading && chapters}
                    keyExtractor={(item) => item.chapterId.toString()}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={15}
                    initialNumToRender={7}
                    renderItem={renderChapterCard}
                    ListHeaderComponent={
                        <NovelInfoHeader
                            theme={theme}
                            item={{ novelName, novelCover }}
                            novel={novel}
                            noOfChapters={chapters?.length}
                            followNovelAction={followNovelAction}
                            loading={loading}
                            lastRead={lastRead}
                            bottomSheetRef={_panel}
                        />
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={fetching}
                            onRefresh={onRefresh}
                            colors={[theme.textColorPrimary]}
                            progressBackgroundColor={theme.colorPrimary}
                        />
                    }
                />
                <Portal>
                    <BottomSheet
                        novelUrl={novelUrl}
                        bottomSheetRef={_panel}
                        sortAndFilterChapters={sortAndFilterChapters}
                    />
                </Portal>
            </View>
        </Provider>
    );
};
const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    novel: state.novelReducer.novel,
    chapters: state.novelReducer.chapters,
    loading: state.novelReducer.loading,
    fetching: state.novelReducer.fetching,
});

export default connect(mapStateToProps, {
    getNovelAction,
    followNovelAction,
    sortAndFilterChapters,
    updateNovelAction,
})(Novel);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
