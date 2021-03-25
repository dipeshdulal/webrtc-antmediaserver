import { useNavigation } from '@react-navigation/core';
import React from 'react'
import { Button, StyleSheet, View } from 'react-native'

export const Menu = () => {
    const { navigate } = useNavigation();
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Button onPress={() => navigate("Viewer")} title="Viewer" />
            <Button onPress={() => navigate("Publisher")} title="Publisher" />
        </View>
    )
}
