import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";

import { connect } from "react-redux";
import EmptyView from "../../Components/EmptyView";
import { getUpdatesAction } from "../../redux/updates/updates.actions";
import { Appbar } from "./components/Appbar";
import UpdateCard from "./components/UpdateCard";

const Updates = ({ theme, updates, loading, getUpdatesAction }) => {
    useFocusEffect(
        useCallback(() => {
            getUpdatesAction();
        }, [getUpdatesAction])
    );

    const renderUpdateCard = ({ item }) => <UpdateCard item={item} />;

    return (
        <>
            <Appbar />
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <FlatList
                    contentContainerStyle={{ flexGrow: 1, paddingVertical: 8 }}
                    data={updates}
                    keyExtractor={(item) => item.updateId.toString()}
                    renderItem={renderUpdateCard}
                    ListFooterComponent={
                        loading && (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    ListEmptyComponent={
                        !loading && (
                            <EmptyView
                                icon="(˘･_･˘)"
                                description="No recent updates"
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
    updates: state.updatesReducer.updates,
    loading: state.updatesReducer.loading,
});

export default connect(mapStateToProps, { getUpdatesAction })(Updates);
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
