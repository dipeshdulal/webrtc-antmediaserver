import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    StyleSheet,
    View,
} from 'react-native';
import { SignalingChannel } from './SignalingChannel';

import { MediaStream, RTCPeerConnection, RTCSessionDescriptionType, RTCView } from "react-native-webrtc";
import { config } from './config';

const STREAM_ID = "170714163152216487974907";

export const Viewer = () => {

    const [remoteStream, setRemoteStream] = useState<MediaStream>();

    const peerConnection = useRef<RTCPeerConnection>()

    const startStreaming = async (remoteDescription: RTCSessionDescriptionType) => {

        peerConnection.current = new RTCPeerConnection({
            iceServers: []
        })

        peerConnection.current.onaddstream = (event) => {
            console.log("on add stream")
            setRemoteStream(event.stream)
        }

        peerConnection.current.onremovestream = () => console.log("stream removed")

        peerConnection.current.onconnectionstatechange = (event) => console.log("state change connection: ", peerConnection.current?.connectionState)

        peerConnection.current.onsignalingstatechange = () => console.log(peerConnection.current?.signalingState)

        peerConnection.current.onicecandidateerror = console.log

        peerConnection.current.onicecandidate = (event) => {
            const candidate = event.candidate;
            if (candidate && signalingChannel.current?.isChannelOpen() && peerConnection.current?.signalingState === "have-remote-offer") {
                console.log("sending local ice candidates")
                signalingChannel.current?.sendJSON({
                    command: "takeCandidate",
                    streamId: STREAM_ID,
                    label: candidate.sdpMLineIndex.toString(),
                    id: candidate.sdpMid,
                    candidate: candidate.candidate,
                })
            }
        }
        
        await peerConnection.current?.setRemoteDescription(remoteDescription)

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        
    }

    const signalingChannel = useRef<SignalingChannel>(new SignalingChannel(config.SIGNALING_URL, {
        onopen: () => {
            signalingChannel.current?.sendJSON({
                command: "play",
                streamId: STREAM_ID,
            })
        },
        start: async () => { },
        stop: () => {
            console.log("stop called")
        },
        takeCandidate: (data) => {
            console.log("onIceCandidate remote");
            peerConnection.current?.addIceCandidate({
                candidate: data?.candidate || "",
                sdpMLineIndex: Number(data?.label) || 0,
                sdpMid: data?.id || "",
            })
        },
        takeConfiguration: async (data) => {
            console.log("got offer: ", data?.type)
            const offer = data?.sdp || "";

            await startStreaming({
                sdp: offer,
                type: data?.type || ""
            });

            signalingChannel.current?.sendJSON({
                command: "takeConfiguration",
                streamId: STREAM_ID,
                type: "answer",
                sdp: peerConnection?.current?.localDescription?.sdp,
            })

        }
    }));

    useEffect(() => {
        return () => {
            signalingChannel.current.close();
        }
    }, [])

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                <Button title="Play" onPress={() => signalingChannel.current.open()} />
                <Button title="Stop" onPress={() => signalingChannel.current.close()} />
            </View>
            {!!remoteStream &&
                <RTCView streamURL={remoteStream?.toURL()} style={{ flex: 1 }} objectFit="cover" />
            }
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
