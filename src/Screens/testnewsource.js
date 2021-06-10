import React from "react";
import { useState } from "react";
import { Button, Text } from "react-native";
import { ScreenContainer } from "../Components/Common";
import { useTheme } from "../Hooks/reduxHooks";
import {
    popularNovels,
    parseNovelAndChapters,
} from "../sources/en/readlightnovel";

const NewExtension = () => {
    const theme = useTheme();

    const [novels, setNovels] = useState([]);
    const [novel, setNovel] = useState([]);

    const onPress = async () => {
        const data = await parseNovelAndChapters("martial-god-asura");
        console.log(data);
    };

    return (
        <ScreenContainer theme={theme}>
            <Text style={{ color: theme.colorAccent, paddingTop: 80 }}>
                New Ext
            </Text>
            <Button title="Popular Novels" onPress={onPress} />
            {novels && (
                <Text style={{ color: theme.colorAccent, paddingTop: 80 }}>
                    {JSON.stringify(novels)}
                </Text>
            )}
        </ScreenContainer>
    );
};

export default NewExtension;
