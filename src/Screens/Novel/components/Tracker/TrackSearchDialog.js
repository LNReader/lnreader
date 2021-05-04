import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ActivityIndicator } from "react-native";
import { Button, Modal, TextInput, TouchableRipple } from "react-native-paper";
import { searchNovels } from "../../../../Services/Trackers/myAnimeList";
import { useSelector, useDispatch } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import { trackNovel } from "../../../../redux/tracker/tracker.actions";

const TrackSearchDialog = ({
    trackSearchDialog,
    setTrackSearchDialog,
    novelId,
    novelName,
    theme,
}) => {
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState(novelName);

    const [selectedNovel, setSelectedNovel] = useState();

    const tracker = useSelector((state) => state.trackerReducer.tracker);

    const dispatch = useDispatch();

    const getSearchresults = async () => {
        const res = await searchNovels(searchText, tracker.access_token);
        setSearchResults(res);
        setLoading(false);
    };

    useEffect(() => {
        trackSearchDialog && getSearchresults();
    }, [trackSearchDialog]);

    const renderSearchResultCard = (item) => (
        <TouchableRipple
            style={[
                { flexDirection: "row", borderRadius: 4, margin: 8 },
                selectedNovel &&
                    selectedNovel.id === item.node.id && {
                        backgroundColor: theme.rippleColor,
                    },
            ]}
            key={item.node.id}
            onPress={() => setSelectedNovel(item.node)}
            rippleColor={theme.rippleColor}
            borderless
        >
            <>
                <Image
                    source={{ uri: item.node.main_picture.large }}
                    style={{ height: 150, width: 100, borderRadius: 4 }}
                />
                <Text
                    style={{
                        flex: 1,
                        color: theme.textColorPrimary,
                        marginLeft: 20,
                        fontSize: 16,
                        flexWrap: "wrap",
                        padding: 8,
                        paddingLeft: 0,
                    }}
                >
                    {item.node.title}
                </Text>
            </>
        </TouchableRipple>
    );

    return (
        <Modal
            visible={trackSearchDialog}
            onDismiss={() => setTrackSearchDialog(false)}
            contentContainerStyle={[
                styles.containerStyle,
                { backgroundColor: theme.colorPrimary },
            ]}
            theme={{ colors: { backdrop: "rgba(0,0,0,0.25)" } }}
        >
            <TextInput
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={getSearchresults}
                theme={{
                    colors: {
                        primary: theme.colorAccent,
                        text: theme.textColorPrimary,
                        background: "transparent",
                    },
                }}
                underlineColor={theme.textColorHint}
                right={
                    <TextInput.Icon
                        color={theme.textColorSecondary}
                        icon="close"
                        onPress={() => setSearchText("")}
                    />
                }
            />
            <ScrollView
                style={{ flexGrow: 1, maxHeight: 500, marginVertical: 8 }}
            >
                {loading ? (
                    <ActivityIndicator
                        color={theme.colorAccent}
                        size={45}
                        style={{ margin: 16 }}
                    />
                ) : (
                    searchResults &&
                    searchResults.data &&
                    searchResults.data.map((result) =>
                        renderSearchResultCard(result)
                    )
                )}
            </ScrollView>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 30,
                }}
            >
                <Button
                    labelStyle={{
                        color: theme.colorAccent,
                        letterSpacing: 0,
                        textTransform: "none",
                    }}
                    theme={{ colors: { primary: theme.colorAccent } }}
                    onPress={() => setSelectedNovel(null)}
                >
                    Remove
                </Button>
                <View style={{ flexDirection: "row" }}>
                    <Button
                        labelStyle={{
                            color: theme.colorAccent,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccent } }}
                        onPress={() => setTrackSearchDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        labelStyle={{
                            color: theme.colorAccent,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccent } }}
                        onPress={() => {
                            if (selectedNovel) {
                                dispatch(
                                    trackNovel(
                                        { ...selectedNovel, novelId },
                                        tracker.access_token
                                    )
                                );
                            }
                            setTrackSearchDialog(false);
                        }}
                    >
                        OK
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

export default TrackSearchDialog;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
});
