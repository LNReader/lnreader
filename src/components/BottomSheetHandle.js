import React from "react";
import { View } from "react-native";

const BottomSheetHandle = ({ theme }) => (
    <View
        style={{
            backgroundColor: theme.textColorHint,
            height: 5,
            width: 30,
            borderRadius: 50,
            top: 10,
            alignSelf: "center",
        }}
    />
);

export default BottomSheetHandle;
