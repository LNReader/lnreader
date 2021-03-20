import React from "react";
import { StyleSheet, View } from "react-native";
import { List } from "react-native-paper";
import Bottomsheet from "rn-sliding-up-panel";

import { useSelector } from "react-redux";

export const BottomSheet = ({ bottomSheetRef, setSort, sort, setLoading }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    const sorting = [
        { label: "Latest", sortFlag: "latest" },
        { label: "A-Z", sortFlag: "aplhabet" },
        { label: "Rating", sortFlag: "rating" },
        { label: "Trending", sortFlag: "trending" },
        { label: "Most Views", sortFlag: "views" },
        { label: "New", sortFlag: "new-manga" },
    ];

    return (
        <Bottomsheet
            ref={bottomSheetRef}
            draggableRange={{ top: 370, bottom: 0 }}
            snappingPoints={[0, 370]}
        >
            <View
                style={[
                    styles.contentContainer,
                    {
                        backgroundColor: theme.colorPrimary,
                    },
                ]}
            >
                <View
                    style={{
                        backgroundColor: theme.textColorHintDark,
                        height: 5,
                        width: 30,
                        borderRadius: 50,
                        top: 10,
                        alignSelf: "center",
                    }}
                />
                <List.Section
                    title="Sort"
                    titleStyle={{
                        color: theme.colorAccentDark,
                        fontWeight: "bold",
                    }}
                    style={{
                        color: theme.colorAccentDark,
                        // backgroundColor: theme.colorAccentDark,
                    }}
                    expanded
                >
                    {sorting.map((item) => (
                        <List.Item
                            right={() =>
                                sort === item.sortFlag && (
                                    <List.Icon
                                        icon="arrow-up"
                                        color={theme.colorAccentDark}
                                        style={{
                                            marginVertical: 0,
                                            paddingVertical: 0,
                                        }}
                                    />
                                )
                            }
                            title={item.label}
                            titleStyle={{
                                fontSize: 15,
                                color: theme.textColorPrimary,
                            }}
                            onPress={() => {
                                setLoading(true);
                                setSort(item.sortFlag);
                            }}
                        />
                    ))}
                </List.Section>
            </View>
        </Bottomsheet>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
});
