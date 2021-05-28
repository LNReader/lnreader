import React, { useEffect } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    Text,
} from "react-native";

import { Appbar } from "../../Components/Appbar";
import HistoryCard from "./components/HistoryCard";

import { connect } from "react-redux";
import EmptyView from "../../Components/EmptyView";

import {
    getHistoryAction,
    deleteHistoryAction,
} from "../../redux/history/history.actions";

import moment from "moment";
import { dateFormat } from "../../Services/utils/constants";

const History = ({
    navigation,
    theme,
    history,
    loading,
    getHistoryAction,
    deleteHistoryAction,
}) => {
    useEffect(() => {
        getHistoryAction();
    }, [getHistoryAction]);

    const renderHistoryCard = ({ item }) => (
        <HistoryCard
            item={item}
            theme={theme}
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
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                    }}
                    data={history}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item }) => (
                        <FlatList
                            keyExtractor={(item) => item.novelId.toString()}
                            data={item.novels}
                            renderItem={renderHistoryCard}
                            ListHeaderComponent={
                                <Text
                                    style={{
                                        textTransform: "uppercase",
                                        paddingVertical: 8,
                                        color: theme.textColorSecondary,
                                    }}
                                >
                                    {moment(item.date).calendar(
                                        null,
                                        dateFormat
                                    )}
                                </Text>
                            }
                        />
                    )}
                    ListFooterComponent={
                        loading && (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccent}
                            />
                        )
                    }
                    ListEmptyComponent={
                        <EmptyView
                            icon="(˘･_･˘)"
                            description="Nothing read recently"
                        />
                    }
                />
                {/* <FlatList
                    contentContainerStyle={{ flexGrow: 1, padding: 8 }}
                    data={history}
                    keyExtractor={(item) => item.novelId.toString()}
                    renderItem={renderHistoryCard}
                    ListFooterComponent={
                        loading && (
                            <ActivityIndicator
                                size="small"
                                color={theme.colorAccent}
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
                /> */}
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    theme: state.settingsReducer.theme,
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
    },
});
