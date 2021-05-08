import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { useLibrary, useTheme } from "../../Hooks/reduxHooks";
import { useDispatch, useSelector } from "react-redux";

import { Searchbar } from "../../Components/Searchbar";
import NovelCover from "../../Components/NovelCover";
import NovelList from "../../Components/NovelList";
import EmptyView from "../../Components/EmptyView";
import GlobalSearchNovelList from "./components/GlobalSearchNovelList";
import { Appbar } from "../../Components/Appbar";
import MigrationSourceCard from "./components/MigrationSourceCard";

const GlobalSearch = ({ navigation }) => {
    const theme = useTheme();

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState("");
    const { sources } = useSelector((state) => state.sourceReducer);

    const library = useLibrary();

    const novelsPerSource = (sourceId) =>
        library.filter((novel) => novel.sourceId === sourceId).length;

    const renderItem = ({ item }) => (
        <MigrationSourceCard
            item={item}
            theme={theme}
            noOfNovels={novelsPerSource(item.sourceId)}
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
            <Appbar title="Source Migration" />
            <FlatList
                data={sources}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

export default GlobalSearch;

const styles = StyleSheet.create({
    container: { flex: 1 },
});
