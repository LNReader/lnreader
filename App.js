import React from "react";
import Router from "./src/navigation/Router";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
    return (
        <NavigationContainer>
            <Router />
        </NavigationContainer>
    );
}
