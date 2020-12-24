import React from "react";
import { StyleSheet, View } from "react-native";
import { List } from "react-native-paper";
import Bottomsheet from "rn-sliding-up-panel";
import { theme } from "../theming/theme";

export const BottomSheet = ({
    bottomSheetRef,
    setSort,
    sort,
    setRefreshing,
}) => (
    <Bottomsheet
        ref={bottomSheetRef}
        draggableRange={{ top: 370, bottom: 0 }}
        snappingPoints={[0, 370]}
    >
        <View
            style={[
                styles.contentContainer,
                {
                    backgroundColor: theme.colorDarkPrimary,
                },
            ]}
        >
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
                <List.Item
                    right={(props) =>
                        sort === "latest" && (
                            <List.Icon
                                {...props}
                                size
                                icon="arrow-up"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    title="Latest"
                    titleStyle={{
                        fontSize: 15,
                        color: theme.textColorPrimaryDark,
                    }}
                    onPress={() => setSort("latest")}
                />
                <List.Item
                    right={(props) =>
                        sort === "alphabet" && (
                            <List.Icon
                                {...props}
                                size
                                icon="arrow-up"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    title="A-Z"
                    titleStyle={{
                        fontSize: 15,
                        color: theme.textColorPrimaryDark,
                    }}
                    onPress={() => {
                        setSort("alphabet");
                        setRefreshing(true);
                    }}
                />
                <List.Item
                    right={(props) =>
                        sort === "rating" && (
                            <List.Icon
                                {...props}
                                size
                                icon="arrow-up"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    title="Rating"
                    titleStyle={{
                        fontSize: 15,
                        color: theme.textColorPrimaryDark,
                    }}
                    onPress={() => {
                        setSort("rating");
                        setRefreshing(true);
                    }}
                />
                <List.Item
                    right={(props) =>
                        sort === "trending" && (
                            <List.Icon
                                {...props}
                                size
                                icon="arrow-up"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    title="Trending"
                    titleStyle={{
                        fontSize: 15,
                        color: theme.textColorPrimaryDark,
                    }}
                    onPress={() => {
                        setSort("trending");
                        setRefreshing(true);
                    }}
                />
                <List.Item
                    right={(props) =>
                        sort === "views" && (
                            <List.Icon
                                {...props}
                                size
                                icon="arrow-up"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    title="Most Views"
                    titleStyle={{
                        fontSize: 15,
                        color: theme.textColorPrimaryDark,
                    }}
                    onPress={() => {
                        setSort("views");
                        setRefreshing(true);
                    }}
                />
                <List.Item
                    right={(props) =>
                        sort === "new-manga" && (
                            <List.Icon
                                {...props}
                                size
                                icon="arrow-up"
                                color={theme.colorAccentDark}
                            />
                        )
                    }
                    title="New"
                    titleStyle={{
                        fontSize: 15,
                        color: theme.textColorPrimaryDark,
                    }}
                    onPress={() => {
                        setSort("new-manga");
                        setRefreshing(true);
                    }}
                />
            </List.Section>
        </View>
    </Bottomsheet>
);

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        // paddingTop: ,
        // alignItems: "center",
    },
});
