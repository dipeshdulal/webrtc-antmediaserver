import React from 'react';
import {
    
    StyleSheet,
    View,
} from 'react-native';
import { Viewer } from './Viewer';

export const MultiViewer = () => {

    return (
        <View style={{flex: 1}}>
           <Viewer streamId="170714163152216487974907" />
           <Viewer streamId="170714163152216487974908" />
        </View>
    );
};

const styles = StyleSheet.create({
    bottom: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-evenly",
        marginBottom: 30
    }
})
