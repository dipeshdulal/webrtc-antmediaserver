import { useNavigation } from '@react-navigation/core';
import React from 'react'
import { Button, View } from 'react-native'

export const Menu = () => {
    const { navigate } = useNavigation();
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Button onPress={() => navigate("Viewer")} title="Viewer" />
            <Button onPress={() => navigate("Publisher1")} title="Publisher1" />
            <Button onPress={() => navigate("Publisher2")} title="Publisher2" />
            <Button onPress={() => navigate("MultiViewer")} title="MultiViewer" />
        </View>
    )
}
