import React from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import { useLibrary, useTheme } from "../../Hooks/reduxHooks";
import { useSelector } from "react-redux";
import { Appbar } from "../../Components/Appbar";
import MigrationSourceCard from "./components/MigrationSourceCard";

const GlobalSearch = ({ navigation }) => {
    const theme = useTheme();

    const { sources } = useSelector((state) => state.sourceReducer);

    const library = useLibrary();

    const novelsPerSource = (sourceId) =>
        library.filter((novel) => novel.sourceId === sourceId).length;

    const renderItem = ({ item }) => (
        <MigrationSourceCard
            item={item}
            theme={theme}
            noOfNovels={novelsPerSource(item.sourceId)}
            buttonLabel="All"
            onPress={() => navigation.navigate("SourceNovels", item.sourceId)}
        />
    );

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colorPrimaryDark },
            ]}
        >
            <Appbar
                title="Select Source"
                onBackAction={() => navigation.goBack()}
            />
            <FlatList
                data={sources}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={renderItem}
                ListHeaderComponent={
                    <Text
                        style={{
                            color: theme.textColorSecondary,
                            padding: 20,
                            paddingBottom: 10,
                            textTransform: "uppercase",
                        }}
                    >
                        Select a Source To Migrate From
                    </Text>
                }
            />
        </View>
    );
};

export default GlobalSearch;

const styles = StyleSheet.create({
    container: { flex: 1 },
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
});
