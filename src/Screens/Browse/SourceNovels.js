import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Portal } from "react-native-paper";
import { useLibrary, useTheme } from "../../Hooks/reduxHooks";
import { useDispatch, useSelector } from "react-redux";

import EmptyView from "../../Components/EmptyView";
import { Appbar } from "../../Components/Appbar";
import ListView from "../../Components/ListView";
import MigrationDialog from "./components/MigrationDialog";
import SourceToMigrateDialog from "./components/SourceToMigrateDialog";
import { showToast } from "../../Hooks/showToast";

const SourceNovels = ({ navigation, route }) => {
    const sourceId = route.params;
    const theme = useTheme();
    const library = useLibrary();

    const sourceNovels = library.filter((novel) => novel.sourceId === sourceId);
    const { sources } = useSelector((state) => state.sourceReducer);

    const [selectedNovel, setSelectedNovel] = useState();
    const [migrationNovel, setMigrationNovel] = useState();
    const [loading, setLoading] = useState(true);

    const [sourceToMigrateDialog, setSourceToMigrateDialog] = useState(false);
    const showSourceToMigrateDialog = () => setSourceToMigrateDialog(true);
    const hideSourceToMigrateDIalog = () => setSourceToMigrateDialog(false);

    const [migrationDialog, setMigrationDialog] = useState(false);
    const showMigrationDialog = () => setMigrationDialog(true);
    const hideMigrationDIalog = () => setMigrationDialog(false);

    const getSearchUrl = (sourceId) => {
        if (sourceId === 1) {
            return `https://lnreader-extensions.vercel.app/api/1/search/?s=${selectedNovel.novelName}&?o=rating`;
        } else {
            return `https://lnreader-extensions.vercel.app/api/${sourceId}/search/?s=${selectedNovel.novelName}`;
        }
    };

    const getNovelToMigrate = (sourceId) => {
        fetch(getSearchUrl(sourceId))
            .then((response) => response.json())
            .then((json) => {
                setMigrationNovel(json[0]);
                console.log(json[0]);
                setLoading(false);
            })
            .catch((error) => {
                showToast(error.message);
                setMigrationDialog(false);
                setSelectedNovel();
            });
    };

    const selectSourceToMigrate = (sourceId) => {
        getNovelToMigrate(sourceId);
        showSourceToMigrateDialog();
    };

    const onPress = (item) => {
        setLoading(true);
        if (selectedNovel && selectedNovel.novelId === item.novelId) {
            setSelectedNovel();
        } else {
            setSelectedNovel({
                novelId: item.novelId,
                novelName: item.novelName,
                novelCover: item.novelCover,
            });
        }
        showSourceToMigrateDialog();
    };

    const renderItem = ({ item }) => (
        <ListView item={item} theme={theme} onPress={() => onPress(item)} />
    );

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colorPrimaryDark },
            ]}
        >
            <Appbar title="Select Novels" />
            <FlatList
                data={sourceNovels}
                keyExtractor={(item) => item.novelId.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <EmptyView description="Your library does not have any novel from this source" />
                }
            />
            <Portal>
                <MigrationDialog
                    migrationDialog={migrationDialog}
                    hideMigrationDialog={hideMigrationDIalog}
                    theme={theme}
                    selectedNovel={selectedNovel}
                    loading={loading}
                    migrationNovel={migrationNovel}
                />
                <SourceToMigrateDialog
                    selectedNovel={selectedNovel}
                    sourceToMigrateDialog={sourceToMigrateDialog}
                    hideSourceToMigrateDialog={hideSourceToMigrateDIalog}
                    sources={sources}
                    theme={theme}
                    showMigrationDialog={showMigrationDialog}
                    selectSourceToMigrate={selectSourceToMigrate}
                />
            </Portal>
        </View>
    );
};

export default SourceNovels;

const styles = StyleSheet.create({
    container: { flex: 1 },
});
