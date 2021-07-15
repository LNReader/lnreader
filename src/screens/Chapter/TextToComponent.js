import React from "react";
import { Text } from "react-native";

import FitImage from "react-native-fit-image";
import { Button } from "react-native-paper";

const getHeadingSize = (size) => {
    const headings = {
        h1: 6,
        h2: 5,
        h3: 4,
        h4: 3,
        h5: 2,
        h6: 1,
    };

    return headings[size];
};

const TextToComponents = ({
    text,
    textStyle,
    textSelectable,
    textSize,
    onPressLink,
    theme,
}) => {
    regex =
        /(\[Image\]\(http.*?\))|(\[h[1-6]\]\(.*?\))|(_.*?_)|(\[Link:\n|.*?\]\(http.*?\))/;

    let parseText = text.trim().split(regex);

    return parseText.map((part, index) => {
        if (part) {
            const isItalic = part.match(/_(.*?)_/);
            const isImage = part.match(/\[Image\]\((http.*?)\)/);
            const isHeading = part.match(/\[(h[1-6])\]\((.*?)\)/);
            const isLink = part.match(/\[Link:((\n|.)*?)\]\((http.*?)\)/);

            if (isImage) {
                return <FitImage source={{ uri: isImage[1] }} key={index} />;
            } else if (isItalic) {
                return (
                    <Text
                        style={[textStyle, { fontStyle: "italic" }]}
                        selectable={textSelectable}
                        key={index}
                    >
                        {isItalic[1]}
                    </Text>
                );
            } else if (isHeading) {
                return (
                    <Text
                        style={[
                            textStyle,
                            {
                                fontSize:
                                    textSize + getHeadingSize(isHeading[1]),
                                fontWeight: "bold",
                            },
                        ]}
                        selectable={textSelectable}
                        key={index}
                    >
                        {isHeading[2]}
                    </Text>
                );
            } else if (isLink) {
                return (
                    <Button
                        key={index}
                        labelStyle={{ letterSpacing: 0 }}
                        uppercase={false}
                        color={theme.colorAccent}
                        onPress={() => onPressLink(isLink[3])}
                    >
                        {isLink[1]}
                    </Button>
                );
            } else {
                return (
                    <Text
                        style={textStyle}
                        selectable={textSelectable}
                        key={index}
                    >
                        {part}
                    </Text>
                );
            }
        }
    });
};

export default TextToComponents;
