import React, { useEffect } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { FAB, ProgressBar } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { ScreenContainer } from "../../components/Common";
import EmptyView from "../../components/EmptyView";

import { useTheme } from "../../hooks/reduxHooks";

import { cancelDownload } from "../../redux/downloads/downloads.actions";

import BackgroundService from "react-native-background-actions";
import { downloadAllChaptersAction } from "../../redux/novel/novel.actions";

const DownloadQueue = ({ navigation }) => {
    const theme = useTheme();
    const { downloadQueue } = useSelector((state) => state.downloadsReducer);

    const dispatch = useDispatch();

    useEffect(() => {
        if (!BackgroundService.isRunning() && downloadQueue.length > 0) {
            dispatch(cancelDownload());
        }
    }, []);

    return (
        <ScreenContainer theme={theme}>
            <Appbar title="Download queue" onBackAction={navigation.goBack} />
            <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                keyExtractor={(item) => item.chapterId.toString()}
                data={downloadQueue}
                renderItem={({ item }) => (
                    <View style={{ padding: 16 }}>
                        <Text style={{ color: theme.textColorPrimary }}>
                            {item.chapterName}
                        </Text>
                        <ProgressBar
                            indeterminate={true}
                            color={theme.colorAccent}
                            style={{ marginTop: 8 }}
                        />
                    </View>
                )}
                ListEmptyComponent={
                    <EmptyView icon="(･o･;)" description="No downloads" />
                }
            />
            {downloadQueue.length > 0 && (
                <FAB
                    style={[styles.fab, { backgroundColor: theme.colorAccent }]}
                    color={theme.textColorPrimary}
                    label="Cancel"
                    uppercase={false}
                    small
                    icon="close"
                    onPress={() => dispatch(cancelDownload())}
                />
            )}
        </ScreenContainer>
    );
};

export default DownloadQueue;

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
