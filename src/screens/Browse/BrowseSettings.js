import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Switch } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { Appbar } from "../../components/Appbar";
import { ScreenContainer } from "../../components/Common";
import { ListSubHeader } from "../../components/List";

import { useSettings, useTheme } from "../../hooks/reduxHooks";
import { setAppSettings } from "../../redux/settings/settings.actions";
import {
    enableDiscover,
    filterLanguage,
} from "../../redux/source/source.actions";

const BrowseSettings = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const {
        filters = [],
        showNovelUpdates = true,
        showMyAnimeList = true,
    } = useSelector((state) => state.sourceReducer);
    const languages = ["English", "Spanish", "Japanese"];
    const { searchAllSources = false } = useSettings();

    const renderItem = ({ item }) => {
        return (
            <Pressable
                android_ripple={{ color: theme.rippleColor }}
                style={{
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                onPress={() => dispatch(filterLanguage(item))}
            >
                <Text style={{ color: theme.textColorPrimary }}>{item}</Text>
                <Switch
                    color={theme.colorAccent}
                    value={filters.indexOf(item) === -1 ? true : false}
                    onValueChange={() => dispatch(filterLanguage(item))}
                />
            </Pressable>
        );
    };

    return (
        <ScreenContainer theme={theme}>
            <Appbar onBackAction={navigation.goBack} title="Sources" />
            <View>
                <ListSubHeader theme={theme}>Global Search</ListSubHeader>
                <Pressable
                    android_ripple={{ color: theme.rippleColor }}
                    style={{
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    onPress={() =>
                        dispatch(
                            setAppSettings(
                                "searchAllSources",
                                !searchAllSources
                            )
                        )
                    }
                >
                    <Text style={{ color: theme.textColorPrimary }}>
                        Search all sources
                    </Text>
                    <Switch
                        color={theme.colorAccent}
                        value={searchAllSources}
                        onValueChange={() =>
                            dispatch(
                                setAppSettings(
                                    "searchAllSources",
                                    !searchAllSources
                                )
                            )
                        }
                    />
                </Pressable>
                <ListSubHeader theme={theme}>Discover</ListSubHeader>
                {/* <Pressable
                    android_ripple={{ color: theme.rippleColor }}
                    style={{
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    onPress={() => dispatch(enableDiscover("showNovelUpdates"))}
                >
                    <Text style={{ color: theme.textColorPrimary }}>
                        Novel Updates
                    </Text>
                    <Switch
                        color={theme.colorAccent}
                        value={showNovelUpdates}
                        onValueChange={() =>
                            dispatch(enableDiscover("showNovelUpdates"))
                        }
                    />
                </Pressable> */}
                <Pressable
                    android_ripple={{ color: theme.rippleColor }}
                    style={{
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    onPress={() => dispatch(enableDiscover("showMyAnimeList"))}
                >
                    <Text style={{ color: theme.textColorPrimary }}>
                        MyAnimeList
                    </Text>
                    <Switch
                        color={theme.colorAccent}
                        value={showMyAnimeList}
                        onValueChange={() =>
                            dispatch(enableDiscover("showMyAnimeList"))
                        }
                    />
                </Pressable>
                <ListSubHeader theme={theme}>Languages</ListSubHeader>
                <FlatList
                    data={languages}
                    keyExtractor={(item) => item}
                    renderItem={renderItem}
                />
            </View>
        </ScreenContainer>
    );
};

export default BrowseSettings;
