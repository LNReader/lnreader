import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { connect, useDispatch } from "react-redux";
import EmptyView from "../../Components/EmptyView";
import {
    getUpdatesAction,
    updateLibraryAction,
} from "../../redux/updates/updates.actions";
import { Appbar } from "./components/Appbar";
import UpdateCard from "./components/UpdateCard";
import { useTheme } from "../../Hooks/useTheme";

const Updates = ({ updates, loading, getUpdatesAction }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getUpdatesAction();
    }, [getUpdatesAction, updates]);

    const onRefresh = async () => {
        setRefreshing(true);
        dispatch(updateLibraryAction());
        setRefreshing(false);
    };

    const renderUpdateCard = ({ item }) => <UpdateCard item={item} />;

    return (
        <>
            <Appbar theme={theme} />
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["white"]}
                            progressBackgroundColor={theme.colorAccentDark}
                        />
                    }
                />
            </View>
        </>
    );
};

const mapStateToProps = (state) => ({
    updates: state.updatesReducer.updates,
    loading: state.updatesReducer.loading,
});

export default connect(mapStateToProps, { getUpdatesAction })(Updates);

const styles = StyleSheet.create({
    container: { flex: 1 },
});
