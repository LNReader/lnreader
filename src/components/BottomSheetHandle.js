import React from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";

const BottomSheetHandle = () => {
    const theme = useSelector((state) => state.themeReducer.theme);
    return (
        <>
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
        </>
    );
};

export default BottomSheetHandle;
