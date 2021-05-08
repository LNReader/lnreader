import React from "react";
import { StyleSheet, Text, ImageBackground, FlatList } from "react-native";
import { Portal, Modal, IconButton } from "react-native-paper";
import MigrationSourceCard from "./MigrationSourceCard";

const SourceToMigrateDialog = ({
    selectedNovel,
    sourceToMigrateDialog,
    hideSourceToMigrateDialog,
    sources,
    selectSourceToMigrate,
    showMigrationDialog,
    theme,
}) => {
    const renderItem = ({ item }) => (
        <MigrationSourceCard
            item={item}
            theme={theme}
            buttonLabel="Select"
            onPress={() => {
                selectSourceToMigrate(item.sourceId);
                hideSourceToMigrateDialog();
                showMigrationDialog();
            }}
        />
    );

    return (
        <Modal
            visible={sourceToMigrateDialog}
            onDismiss={hideSourceToMigrateDialog}
            contentContainerStyle={[
                styles.containerStyle,
                { backgroundColor: theme.colorPrimaryDark },
            ]}
        >
            <FlatList
                data={sources}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={renderItem}
            />
        </Modal>
    );
};

export default SourceToMigrateDialog;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
