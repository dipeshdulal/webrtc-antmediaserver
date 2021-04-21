import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Menu } from "./Menu";
import { Publisher } from "./Publisher";
import { Viewer } from "./Viewer";
import { MultiViewer } from "./MultiViewer";

const StackNavigator = createStackNavigator();

export const App = () => {
  return (
    <StackNavigator.Navigator initialRouteName="Menu">
      <StackNavigator.Screen name="Menu" component={Menu} />
      <StackNavigator.Screen name="Publisher1" component={() => <Publisher viewerId="170714163152216487974908" streamId="170714163152216487974907"/>} />
      <StackNavigator.Screen name="Publisher2" component={() => <Publisher viewerId="170714163152216487974907" streamId="170714163152216487974908" />} />
      <StackNavigator.Screen name="Viewer" component={Viewer} />
      <StackNavigator.Screen name="MultiViewer" component={MultiViewer} />
    </StackNavigator.Navigator>
  )
};
