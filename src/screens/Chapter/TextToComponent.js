import React, { memo, useCallback, useEffect } from "react";
import { Text, View } from "react-native";

import FitImage from "react-native-fit-image";
import { showToast } from "../../hooks/showToast";

const getHeadingSize = (size) => {
    const headings = {
        h1: 6,
        h2: 5,
        h3: 4,
        h4: 3,
        h5: 2,
        h6: 1,
        strong: 0,
    };

    return headings[size];
};

const Header = ({ size, text, textStyle, textSelectable, textSize }) => (
    <Text
        style={[
            textStyle,
            {
                fontSize: textSize + getHeadingSize(size),
                fontWeight: "bold",
            },
        ]}
        selectable={textSelectable}
    >
        {text}
    </Text>
);

const DefaultText = ({ text, textStyle, textSelectable }) => (
    <Text style={textStyle} selectable={textSelectable}>
        {text}
    </Text>
);

const ItalicText = ({ text, textStyle, textSelectable }) => (
    <Text
        style={[textStyle, { fontStyle: "italic" }]}
        selectable={textSelectable}
    >
        {text}
    </Text>
);

const HorizontalRule = ({ textColor }) => (
    <View
        style={{
            borderBottomWidth: 1,
            flex: 1,
            borderBottomColor: textColor,
            marginVertical: 16,
        }}
    />
);

const Link = ({
    link,
    text,
    textStyle,
    textSelectable,
    onPressLink,
    theme,
}) => (
    <Text
        style={[
            textStyle,
            {
                alignSelf: "flex-start",
                color: theme.colorAccent,
                textDecorationLine: "underline",
            },
        ]}
        selectable={textSelectable}
        onPress={() => onPressLink(link)}
    >
        {text}
    </Text>
);

const TextToComponents = ({
    text,
    textStyle,
    textSelectable,
    textSize,
    textColor,
    onPressLink,
    theme,
}) => {
    try {
        regex = /(\[(?:\n|.)*?\]\(.*?\))/;

        let parseText = text.trim().split(regex);
        return parseText.map((part, index) => {
            if (part) {
                let match = part.match(/\[((?:\n|.)*?)\]\((.*?)\)/);

                if (match) {
                    tag = match[1];
                    text = match[2];

                    if (tag.startsWith("Anchor:")) {
                        link = tag.replace("Anchor: ", "");
                        tag = "a";
                    }

                    switch (tag) {
                        case "h1":
                            return (
                                <Header
                                    size="h1"
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                    textSize={textSize}
                                />
                            );
                        case "h2":
                            return (
                                <Header
                                    size="h2"
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                    textSize={textSize}
                                />
                            );
                        case "h3":
                            return (
                                <Header
                                    size="h3"
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                    textSize={textSize}
                                />
                            );
                        case "h4":
                            return (
                                <Header
                                    size="h4"
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                    textSize={textSize}
                                />
                            );
                        case "h5":
                            return (
                                <Header
                                    size="h5"
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                    textSize={textSize}
                                />
                            );
                        case "h6":
                            return (
                                <Header
                                    size="h6"
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                    textSize={textSize}
                                />
                            );
                        case "strong":
                            return (
                                <Header
                                    size="strong"
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                    textSize={textSize}
                                />
                            );
                        case "em":
                            return (
                                <ItalicText
                                    text={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                />
                            );

                        case "a":
                            return (
                                <Link
                                    link={text}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    text={link}
                                    onPressLink={onPressLink}
                                    theme={theme}
                                    key={index}
                                />
                            );
                        case "img":
                            return (
                                <FitImage source={{ uri: text }} key={index} />
                            );
                        case "hr":
                            return (
                                <HorizontalRule
                                    key={index}
                                    textColor={textColor}
                                />
                            );
                        default:
                            return (
                                <DefaultText
                                    text={part}
                                    textStyle={textStyle}
                                    textSelectable={textSelectable}
                                    key={index}
                                />
                            );
                    }
                } else {
                    return (
                        <DefaultText
                            text={part}
                            textStyle={textStyle}
                            textSelectable={textSelectable}
                            key={index}
                        />
                    );
                }
            }
        });
    } catch (error) {
        return (
            <DefaultText
                text={text}
                textStyle={textStyle}
                textSelectable={textSelectable}
                key={index}
            />
        );
    }
};

export default memo(TextToComponents);
