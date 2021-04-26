import React, { useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { Appbar } from "../../components/Appbar";
import { connect } from "react-redux";

import { getSourcesAction } from "../../redux/source/source.actions";

import ExtensionCard from "./components/ExtensionCard";

const Browse = ({ theme, extensions, loading, getSourcesAction }) => {
    useEffect(() => {
        getSourcesAction();
    }, [getSourcesAction]);

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
                    renderItem={({ item }) => <ExtensionCard item={item} />}
                    ListEmptyComponent={
                        loading && (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccentDark}
                                style={{ marginTop: 16 }}
                            />
                        )
                    }
                />
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    theme: state.themeReducer.theme,
    extensions: state.extensionReducer.extensions,
    loading: state.extensionReducer.loading,
});

export default connect(mapStateToProps, { getSourcesAction })(Browse);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
