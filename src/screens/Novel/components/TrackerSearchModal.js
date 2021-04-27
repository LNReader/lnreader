import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Image, ActivityIndicator } from "react-native";
import { Button, Modal, TextInput, TouchableRipple } from "react-native-paper";
import { searchNovels } from "../../../trackers/MyAnimeList";
import { useSelector, useDispatch } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import { trackNovel } from "../../../redux/tracker/tracker.actions";

const TrackerSearchModal = ({
    visible,
    hideModal,
    novelId,
    novelName,
    theme,
}) => {
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState(novelName);

    const [selectedNovel, setSelectedNovel] = useState();

    const tracker = useSelector((state) => state.trackerReducer.tracker);

    const textInputRef = useRef(null);

    const dispatch = useDispatch();

    const getSearchresults = async () => {
        const res = await searchNovels(searchText, tracker.access_token);
        setSearchResults(res);
        setLoading(false);
    };

    useEffect(() => {
        visible && getSearchresults();
    }, [visible]);

    const renderSearcResultCard = (item) => (
        <TouchableRipple
            style={[
                { flexDirection: "row", borderRadius: 4, margin: 8 },
                selectedNovel &&
                    selectedNovel === item.node.id && {
                        backgroundColor: theme.rippleColor,
                    },
            ]}
            key={item.node.id}
            onPress={() => setSelectedNovel(item.node.id)}
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
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={[
                styles.containerStyle,
                { backgroundColor: theme.colorPrimary },
            ]}
        >
            <TextInput
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={getSearchresults}
                theme={{
                    colors: {
                        primary: theme.colorAccentDark,
                        text: theme.textColorPrimary,
                        background: "transparent",
                    },
                }}
                underlineColor={theme.textColorHintDark}
                dense
                right={
                    <TextInput.Icon
                        color={theme.textColorSecondary}
                        icon="close"
                        onPress={() => setSearchText("")}
                    />
                }
            />
            <ScrollView
                style={{ flexGrow: 1, maxHeight: 600, paddingVertical: 12 }}
            >
                {loading ? (
                    <ActivityIndicator
                        color={theme.colorAccentDark}
                        size={45}
                        style={{ margin: 16 }}
                    />
                ) : (
                    searchResults.data.map((result) =>
                        renderSearcResultCard(result)
                    )
                )}
            </ScrollView>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <Button
                    style={{ marginTop: 30 }}
                    labelStyle={{
                        color: theme.colorAccentDark,
                        letterSpacing: 0,
                        textTransform: "none",
                    }}
                    theme={{ colors: { primary: theme.colorAccentDark } }}
                    onPress={() => setSelectedNovel(null)}
                >
                    Remove
                </Button>
                <View style={{ flexDirection: "row" }}>
                    <Button
                        style={{ marginTop: 30 }}
                        labelStyle={{
                            color: theme.colorAccentDark,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccentDark } }}
                        onPress={hideModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        style={{ marginTop: 30 }}
                        labelStyle={{
                            color: theme.colorAccentDark,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccentDark } }}
                        onPress={() => {
                            if (selectedNovel) {
                                dispatch(
                                    trackNovel({
                                        novelId,
                                        malId: selectedNovel,
                                    })
                                );
                            }
                            hideModal();
                        }}
                    >
                        OK
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

export default TrackerSearchModal;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
});
