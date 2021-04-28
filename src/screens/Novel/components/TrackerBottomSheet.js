import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import Bottomsheet from "rn-sliding-up-panel";

import { useSelector, useDispatch } from "react-redux";
import { findListItem } from "../../../trackers/MyAnimeList";
import { TouchableRipple, Portal, Modal, TextInput } from "react-native-paper";
import { updateTracker } from "../../../redux/tracker/tracker.actions";

export const TrackerBottomSheet = ({ bottomSheetRef, novelId, showModal }) => {
    const theme = useSelector((state) => state.themeReducer.theme);
    const tracker = useSelector((state) => state.trackerReducer.tracker);
    const trackedNovels = useSelector(
        (state) => state.trackerReducer.trackedNovels
    );
    const dispatch = useDispatch();

    // console.log(trackedNovels);
    let sheetHeight = 70;

    const [myListStatus, setMyListStatus] = useState();

    // setMyListStatus(trackedNovels.find((obj) => obj.novelId === novelId));

    // const isNovelTracked = async (id) => {
    //     let trackingStatus =
    //         trackedNovels && trackedNovels.find((obj) => obj.novelId === id);
    //     if (trackingStatus) {
    //         let res = await findListItem(
    //             trackingStatus.malId,
    //             tracker.access_token
    //         );
    //         sheetHeight = 200;
    //         setMyListStatus(res);
    //         console.log(res);
    //     }
    // };

    const renderTrackerCard = () => {
        return (
            <View
                style={{
                    flex: 1,
                    margin: 8,
                    elevation: 2,
                    borderRadius: 4,
                    backgroundColor: theme.colorPrimary,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderBottomColor: theme.dividerColor,
                        borderBottomWidth: 1,
                    }}
                >
                    <Image
                        source={{
                            uri:
                                "https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png",
                        }}
                        style={{
                            height: 50,
                            width: 50,
                            borderTopLeftRadius: 4,
                        }}
                    />
                    <TouchableRipple
                        style={{
                            flex: 1,
                            borderTopRightRadius: 4,
                        }}
                        borderless
                        onPress={() => console.log("Title Pressed")}
                        rippleColor={theme.rippleColor}
                    >
                        <Text
                            style={{
                                flex: 1,
                                textAlign: "center",
                                textAlignVertical: "center",
                                color: theme.textColorSecondary,
                            }}
                            // onPress={showModal}
                        >
                            {myListStatus.title}
                        </Text>
                    </TouchableRipple>
                </View>
                <View
                    style={{
                        height: 50,
                        flexDirection: "row",
                        borderBottomColor: theme.dividerColor,
                        borderBottomWidth: 1,
                    }}
                >
                    <TouchableRipple
                        style={{
                            flex: 1,
                            borderRightWidth: 1,
                            borderRightColor: theme.dividerColor,
                            borderBottomLeftRadius: 4,
                        }}
                        borderless
                        onPress={() => console.log("Title Pressed")}
                        rippleColor={theme.rippleColor}
                    >
                        <Text
                            style={{
                                flex: 1,
                                textAlign: "center",
                                textAlignVertical: "center",
                                color: theme.textColorSecondary,
                            }}
                            // onPress={showModal}
                        >
                            {myListStatus.my_list_status.status}
                        </Text>
                    </TouchableRipple>
                    <TouchableRipple
                        style={{
                            flex: 1,
                        }}
                        borderless
                        onPress={showModal2}
                        rippleColor={theme.rippleColor}
                    >
                        <Text
                            style={{
                                flex: 1,
                                textAlign: "center",
                                textAlignVertical: "center",
                                color: theme.textColorSecondary,
                            }}
                            // onPress={showModal}
                        >
                            {myListStatus.my_list_status.num_chapters_read}
                        </Text>
                    </TouchableRipple>
                    <TouchableRipple
                        style={{
                            flex: 1,
                            borderLeftWidth: 1,
                            borderLeftColor: theme.dividerColor,
                            borderBottomRightRadius: 4,
                        }}
                        borderless
                        onPress={() =>
                            dispatch(
                                updateTracker(
                                    myListStatus.id,
                                    tracker.access_token,
                                    {
                                        ...myListStatus.my_list_status,
                                    }
                                )
                            )
                        }
                        rippleColor={theme.rippleColor}
                    >
                        <Text
                            style={{
                                flex: 1,
                                textAlign: "center",
                                textAlignVertical: "center",
                                color: theme.textColorSecondary,
                            }}
                            // onPress={showModal}
                        >
                            {myListStatus.my_list_status.score ?? "-"}
                        </Text>
                    </TouchableRipple>
                </View>
            </View>
        );
    };

    useEffect(() => {
        let trackStatus = trackedNovels.find((obj) => obj.novelId === novelId);
        setMyListStatus(trackStatus);
        console.log(trackStatus);
    }, [trackedNovels]);
    const [visible, setVisible] = useState(false);
    const showModal2 = () => setVisible(true);
    const hideModal = () => setVisible(false);
    return (
        <>
            <Bottomsheet
                ref={bottomSheetRef}
                draggableRange={{ top: 120, bottom: 0 }}
                snappingPoints={[0, 120]}
            >
                <View
                    style={[
                        styles.contentContainer,
                        { backgroundColor: theme.colorPrimary },
                    ]}
                >
                    {!myListStatus ? (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                margin: 8,
                                borderRadius: 4,
                                elevation: 2,
                                backgroundColor: theme.colorPrimary,
                            }}
                        >
                            <Image
                                source={{
                                    uri:
                                        "https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png",
                                }}
                                style={{
                                    height: 50,
                                    width: 50,
                                    borderTopLeftRadius: 4,
                                    borderBottomLeftRadius: 4,
                                }}
                            />
                            <Text
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    color: theme.colorAccentDark,
                                }}
                                onPress={showModal}
                            >
                                Add Tracking
                            </Text>
                        </View>
                    ) : (
                        renderTrackerCard()
                    )}
                </View>
            </Bottomsheet>
            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={{
                        backgroundColor: theme.colorPrimary,
                        margin: 20,
                        padding: 8,
                    }}
                >
                    <Text style={{ color: "white" }}>
                        Enter number of chapters read
                    </Text>
                    <TextInput
                        value={myListStatus.my_list_status.num_chapters_read}
                        // onChangeText={(number) =>
                        //     setMyListStatus({
                        //         ...myListStatus,
                        //         my_list_status: {
                        //             ...my_list_status,
                        //             num_chapters_read: number,
                        //         },
                        //     })
                        // }
                        keyboardType="numeric"
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
                    />
                </Modal>
            </Portal>
        </>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        // borderTopRightRadius: 8,
        // borderTopLeftRadius: 8,
    },
    bottomSheetHandle: {
        backgroundColor: "rgba(255,255,255,0.25)",
        height: 4,
        width: 50,
        borderRadius: 50,
        top: 10,
        alignSelf: "center",
    },
});
