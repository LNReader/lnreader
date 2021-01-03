import React from "react";
import { StyleSheet, View, Text, FlatList, Image } from "react-native";
import { TouchableRipple, IconButton, Button } from "react-native-paper";
import { CustomAppbar } from "../components/Appbar";
import { theme } from "../theming/theme";
import { sources } from "../utils/sources";

const Browse = ({ navigation }) => {
    return (
        <>
            <CustomAppbar title="Browse" />
            <View style={styles.container}>
                <FlatList
                    data={sources}
                    keyExtractor={(item) => item.sourceId.toString()}
                    renderItem={({ item }) => (
                        <TouchableRipple
                            style={styles.sourceCard}
                            onPress={() =>
                                navigation.navigate(item.sourceName + "Stack")
                            }
                            rippleColor={theme.rippleColorDark}
                        >
                            <>
                                <Image
                                    source={{
                                        uri: item.sourceCover,
                                    }}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 6,
                                    }}
                                    resizeMode="contain"
                                />
                                <View
                                    style={{
                                        marginLeft: 15,
                                        flex: 1,
                                        justifyContent: "space-between",
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <View>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorPrimaryDark,
                                                fontSize: 14,
                                            }}
                                        >
                                            {item.sourceName}
                                        </Text>
                                        <Text
                                            style={{
                                                color:
                                                    theme.textColorSecondaryDark,
                                                fontSize: 12,
                                            }}
                                        >
                                            {item.sourceLanguage}
                                        </Text>
                                    </View>
                                    <View>
                                        {/* <IconButton
                                            icon="magnify"
                                            color={theme.textColorSecondaryDark}
                                            size={24}
                                            onPress={() =>
                                                navigation.navigate(
                                                    item.sourceName + "Stack",
                                                    {
                                                        screen:
                                                            item.sourceName +
                                                            "Search",
                                                    }
                                                )
                                            }
                                        /> */}
                                        <Button
                                            labelStyle={{ letterSpacing: 0 }}
                                            uppercase={false}
                                            color={theme.colorAccentDark}
                                            onPress={() =>
                                                navigation.navigate(
                                                    item.sourceName + "Stack"
                                                )
                                            }
                                        >
                                            Browse
                                        </Button>
                                    </View>
                                </View>
                            </>
                        </TouchableRipple>
                    )}
                />
            </View>
        </>
    );
};

export default Browse;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colorDarkPrimaryDark,
        // backgroundColor: "#000000",
    },
    sourceCard: {
        // backgroundColor: "pink",
        paddingVertical: 10,
        marginVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
    },
});
