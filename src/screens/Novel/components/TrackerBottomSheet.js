import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import Bottomsheet from "rn-sliding-up-panel";

import { useSelector } from "react-redux";
import { findListItem } from "../../../trackers/MyAnimeList";

export const TrackerBottomSheet = ({ bottomSheetRef, novelId, showModal }) => {
    const theme = useSelector((state) => state.themeReducer.theme);
    const tracker = useSelector((state) => state.trackerReducer.tracker);
    const trackedNovels = useSelector(
        (state) => state.trackerReducer.trackedNovels
    );

    const [myListStatus, setMyListStatus] = useState();

    const isNovelTracked = async (id) => {
        let trackingStatus =
            trackedNovels && trackedNovels.find((obj) => obj.novelId === id);
        if (trackingStatus) {
            let res = await findListItem(
                trackingStatus.malId,
                tracker.access_token
            );
            setMyListStatus(res);
            console.log(res);
        }
    };

    useEffect(() => {
        isNovelTracked(novelId);
    }, []);

    return (
        <Bottomsheet
            ref={bottomSheetRef}
            draggableRange={{ top: 70, bottom: 0 }}
            snappingPoints={[0, 70]}
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
                    <Text>{myListStatus.title}</Text>
                )}
            </View>
        </Bottomsheet>
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
