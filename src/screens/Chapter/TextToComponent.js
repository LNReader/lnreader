import React from "react";
import { Text } from "react-native";

import FitImage from "react-native-fit-image";

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

const TextToComponents = ({ text, textStyle, textSelectable, textSize }) => {
    // let imagePattern = /(\[Image\]\(http.*?\))/;
    // let italicPattern = /(_.*?_)/;
    // let headingPattern = /(\[h[1-6]\]\(.*?\))/;

    // patterns = [imagePattern, headingPattern, italicPattern];
    // regex = new RegExp(patterns.join("|"), "g");

    // console.log(regex);

    regex = /(\[Image\]\(http.*?\))|(\[h[1-6]\]\(.*?\))|(_.*?_)/;

    let parseText = text.trim().split(regex);

    // console.log(parseText);

    return parseText.map((part, index) => {
        if (part) {
            const isItalic = part.match(/_(.*?)_/);
            const isImage = part.match(/\[Image\]\((http.*?)\)/);
            const isHeading = part.match(/\[(h[1-6])\]\((.*?)\)/);

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
