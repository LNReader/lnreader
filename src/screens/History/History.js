import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";

import { Appbar } from "../../Components/Appbar";
import HistoryCard from "./components/HistoryCard";

import { connect } from "react-redux";
import EmptyView from "../../Components/EmptyView";

import {
    getHistoryAction,
    deleteHistoryAction,
} from "../../redux/history/history.actions";

const History = ({
    navigation,
    theme,
    history,
    loading,
    getHistoryAction,
    deleteHistoryAction,
}) => {
    useFocusEffect(
        useCallback(() => {
            getHistoryAction();
        }, [getHistoryAction])
    );

    const renderHistoryCard = ({ item }) => (
        <HistoryCard
            item={item}
            deleteHistoryAction={deleteHistoryAction}
            navigation={navigation}
        />
    );

    return (
        <>
            <Appbar title="History" />
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <FlatList
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={history}
                    keyExtractor={(item) => item.novelUrl.toString()}
                    renderItem={renderHistoryCard}
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
                                description="Nothing read recently"
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
    history: state.historyReducer.history,
    loading: state.historyReducer.loading,
});

export default connect(mapStateToProps, {
    getHistoryAction,
    deleteHistoryAction,
})(History);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
});
