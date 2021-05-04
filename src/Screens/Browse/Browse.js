import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Appbar } from "../../Components/Appbar";
import { connect } from "react-redux";
import { useTheme } from "../../Hooks/reduxHooks";

import { getSourcesAction } from "../../redux/source/source.actions";

import ExtensionCard from "./components/ExtensionCard";
import { showToast } from "../../Hooks/showToast";

const Browse = ({ extensions, loading, getSourcesAction }) => {
    const [refreshing, setRefreshing] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        getSourcesAction();
    }, [getSourcesAction]);

    const onRefresh = () => {
        showToast("Updating extension list");
        setRefreshing(true);
        getSourcesAction();
        setRefreshing(false);
    };

    const renderExtensionCard = ({ item }) => (
        <ExtensionCard item={item} theme={theme} />
    );

    return (
        <>
            <Appbar title="Browse" />
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <FlatList
                    data={extensions}
                    keyExtractor={(item) => item.sourceId.toString()}
                    renderItem={renderExtensionCard}
                    ListEmptyComponent={
                        loading && (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccent}
                                style={{ marginTop: 16 }}
                            />
                        )
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["white"]}
                            progressBackgroundColor={theme.colorAccent}
                        />
                    }
                />
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    extensions: state.extensionReducer.extensions,
    loading: state.extensionReducer.loading,
});

export default connect(mapStateToProps, { getSourcesAction })(Browse);

const styles = StyleSheet.create({
    container: { flex: 1 },
});
