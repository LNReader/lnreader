import React, { useState } from "react";
import { StyleSheet, FlatList, Text, View } from "react-native";
import { Portal, Modal, Button } from "react-native-paper";
import { migrateNovel } from "../../../Database/queries/NovelQueries";
import { showToast } from "../../../Hooks/showToast";
import GlobalSearchNovelCover from "./GlobalSearchNovelCover";

const MigrationNovelList = ({ data, theme, library, navigation }) => {
    const [selectedNovel, setSelectedNovel] = useState(false);

    const [migrateNovelDialog, setMigrateNovelDialog] = useState(false);
    const showMigrateNovelDialog = () => setMigrateNovelDialog(true);
    const hideMigrateNovelDialog = () => setMigrateNovelDialog(false);

    const checkIFInLibrary = (sourceId, novelUrl) => {
        return library.some(
            (obj) => obj.novelUrl === novelUrl && obj.sourceId === sourceId
        );
    };

    const renderItem = ({ item }) => (
        <GlobalSearchNovelCover
            item={item}
            onPress={() =>
                showModal(item.extensionId, item.novelUrl, item.novelName)
            }
            libraryStatus={checkIFInLibrary(item.extensionId, item.novelUrl)}
        />
    );

    const showModal = (sourceId, novelUrl, novelName) => {
        if (checkIFInLibrary(sourceId, novelUrl)) {
            showToast("Novel already in library");
        } else {
            setSelectedNovel({ sourceId, novelUrl, novelName });
            showMigrateNovelDialog();
        }
    };

    return (
        <>
            <FlatList
                contentContainerStyle={styles.flatListCont}
                horizontal={true}
                data={data}
                keyExtractor={(item) => item.novelUrl}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text
                        style={{
                            color: theme.textColorSecondary,
                            padding: 8,
                            paddingVertical: 4,
                        }}
                    >
                        No results found
                    </Text>
                }
            />
            <Portal>
                <Modal
                    visible={migrateNovelDialog}
                    onDismiss={hideMigrateNovelDialog}
                    contentContainerStyle={{
                        padding: 20,
                        margin: 20,
                        borderRadius: 6,
                        backgroundColor: theme.colorPrimaryDark,
                    }}
                >
                    <Text
                        style={{
                            color: theme.textColorPrimary,
                            fontSize: 18,
                        }}
                    >
                        {`Migrate ${selectedNovel.novelName}?`}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            style={{ marginTop: 30 }}
                            labelStyle={{
                                color: theme.colorAccent,
                                letterSpacing: 0,
                                textTransform: "none",
                            }}
                            onPress={hideMigrateNovelDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            style={{ marginTop: 30 }}
                            labelStyle={{
                                color: theme.colorAccent,
                                letterSpacing: 0,
                                textTransform: "none",
                            }}
                            theme={{ colors: { primary: theme.colorAccent } }}
                            onPress={() => {
                                migrateNovel(
                                    selectedNovel.sourceId,
                                    selectedNovel.novelUrl
                                );
                                hideMigrateNovelDialog();
                                showToast(
                                    `${selectedNovel.novelName} migrated to new source.`
                                );
                            }}
                        >
                            Migrate
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </>
    );
};

export default MigrationNovelList;

const styles = StyleSheet.create({
    flatListCont: {
        flexGrow: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
