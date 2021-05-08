import React from "react";
import {
    StyleSheet,
    Text,
    ImageBackground,
    View,
    ActivityIndicator,
} from "react-native";
import { Portal, Modal, IconButton, Button } from "react-native-paper";
import { migrateNovel } from "../../../Database/queries/NovelQueries";
import { showToast } from "../../../Hooks/showToast";

const MigrationDialog = ({
    migrationDialog,
    hideMigrationDialog,
    selectedNovel,
    theme,
    loading,
    migrationNovel,
}) => {
    const comfortableTitle = (name) => (
        <Text
            numberOfLines={2}
            style={[
                styles.title,
                {
                    color: theme.textColorPrimary,
                    padding: 4,
                },
            ]}
        >
            {name}
        </Text>
    );

    return (
        <Portal>
            <Modal
                visible={migrationDialog}
                onDismiss={hideMigrationDialog}
                contentContainerStyle={[
                    styles.containerStyle,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                >
                    {selectedNovel && (
                        <>
                            <View style={{ flex: 1, flexDirection: "row" }}>
                                <View style={{ flex: 1 / 3 }}>
                                    <ImageBackground
                                        source={{
                                            uri: selectedNovel.novelCover,
                                        }}
                                        style={{ height: 180, width: 120 }}
                                        imageStyle={{ borderRadius: 4 }}
                                        progressiveRenderingEnabled={true}
                                    />
                                    {comfortableTitle(selectedNovel.novelName)}
                                </View>
                                <View
                                    style={{
                                        flex: 1 / 3,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <IconButton
                                        icon="chevron-right"
                                        color={theme.textColorPrimary}
                                        size={21}
                                    />
                                </View>
                                {loading ? (
                                    <View
                                        style={{
                                            flex: 1 / 3,
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <ActivityIndicator
                                            size="small"
                                            color={theme.colorAccent}
                                        />
                                    </View>
                                ) : migrationNovel ? (
                                    <View style={{ flex: 1 / 3 }}>
                                        <ImageBackground
                                            source={{
                                                uri: migrationNovel.novelCover,
                                            }}
                                            style={{ height: 180, width: 120 }}
                                            imageStyle={{ borderRadius: 4 }}
                                            progressiveRenderingEnabled={true}
                                        />
                                        {comfortableTitle(
                                            migrationNovel.novelName
                                        )}
                                    </View>
                                ) : (
                                    <Text
                                        style={{
                                            flex: 1 / 3,
                                            color: theme.textColorPrimary,
                                            justifyContent: "center",
                                            alignSelf: "center",
                                        }}
                                    >
                                        No Alternatives Found
                                    </Text>
                                )}
                            </View>
                        </>
                    )}
                </View>
                {!loading && migrationNovel && (
                    <View
                        style={{
                            alignItems: "flex-end",
                            marginTop: 20,
                        }}
                    >
                        <Button
                            labelStyle={{
                                color: theme.colorAccent,
                                letterSpacing: 0,
                                textTransform: "none",
                            }}
                            theme={{
                                colors: {
                                    primary: theme.colorAccent,
                                },
                            }}
                            onPress={() => {
                                migrateNovel(
                                    migrationNovel.extensionId,
                                    migrationNovel.novelUrl
                                );
                                hideMigrationDialog();
                                showToast(
                                    `${migrationNovel.novelName} migrated to new source.`
                                );
                            }}
                        >
                            Migrate
                        </Button>
                    </View>
                )}
            </Modal>
        </Portal>
    );
};

export default MigrationDialog;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 14,
        padding: 8,
    },
});
