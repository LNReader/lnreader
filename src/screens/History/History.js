import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";

import { Appbar } from "../../components/common/Appbar";
import HistoryCard from "./components/HistoryCard";

import { connect } from "react-redux";
import EmptyView from "../../components/common/EmptyView";

import {
    getHistory,
    deleteChapterFromHistory,
} from "../../redux/actions/history";

const History = ({
    navigation,
    theme,
    history,
    loading,
    getHistory,
    deleteChapterFromHistory,
}) => {
    useFocusEffect(
        useCallback(() => {
            getHistory();
        }, [])
    );

    const renderHistoryCard = ({ item }) => (
        <HistoryCard
            item={item}
            deleteHistory={deleteChapterFromHistory}
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
    getHistory,
    deleteChapterFromHistory,
})(History);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
});
