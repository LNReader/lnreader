import React, { useState } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";

import Bottomsheet from "rn-sliding-up-panel";
import BottomSheetHandle from "../../../Components/BottomSheetHandle";

const ChapterActionsSheet = ({
    bottomSheetRef,
    selected,
    theme,
    setSelected,
}) => {
    const [animatedValue] = useState(new Animated.Value(0));

    return (
        <Bottomsheet
            animatedValue={animatedValue}
            ref={bottomSheetRef}
            draggableRange={{ top: 100, bottom: 0 }}
            snappingPoints={[0, 100]}
            showBackdrop={false}
            allowDragging={false}
            onBackButtonPress={() => {
                setSelected([]);
                bottomSheetRef.current.hide();
            }}
        >
            <View
                style={[
                    styles.contentContainer,
                    { backgroundColor: theme.colorPrimary },
                ]}
            >
                {/* <BottomSheetHandle theme={theme} /> */}
                <Text>{selected}</Text>
            </View>
        </Bottomsheet>
    );
};

export default ChapterActionsSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
});
