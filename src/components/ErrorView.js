import React from "react";
import { Text, View } from "react-native";

import { IconButton } from "react-native-paper";
import { Row } from "./Common";

import EmptyView from "./EmptyView";

const ErrorView = ({ theme, onRetry, error, openWebView }) => (
    <View style={{ flex: 1, justifyContent: "center" }}>
        <EmptyView
            icon="(；￣Д￣)"
            description={error}
            style={{ color: theme.textColorSecondary }}
        >
            <IconButton
                icon="reload"
                size={25}
                style={{ margin: 0, marginTop: 24 }}
                color={theme.text}
                onPress={onRetry}
            />
            <Text style={{ color: theme.textColorPrimary }}>Retry</Text>
        </EmptyView>
    </View>
);

export default ErrorView;
