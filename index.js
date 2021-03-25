/**
 * @format
 */

import React from "react";
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { App } from "./App";

const InitialComponent = () => {
    return (
        <NavigationContainer>
            <App />
        </NavigationContainer>
    )
}

AppRegistry.registerComponent(appName, () => InitialComponent);
