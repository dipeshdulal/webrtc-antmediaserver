import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import { SignalingChannel } from './SignalingChannel';

import { mediaDevices, MediaStream, RTCPeerConnection, RTCView } from "react-native-webrtc";
import { config } from './config';

const STREAM_ID = "stream-12345";

const isFrontCamera = false;

const App = () => {

  const [localStream, setLocalStream] = useState<MediaStream>();

  const peerConnection = useRef<RTCPeerConnection>(new RTCPeerConnection({
    iceServers: []
  }))

  const signalingChannel = useRef<SignalingChannel>();

  useEffect(() => {
    if (!localStream) { return; }
    const initConnection = async () => {
      peerConnection.current.onsignalingstatechange = () => console.log(peerConnection.current.signalingState)
      peerConnection.current?.addStream(localStream);

      peerConnection.current.onicecandidateerror = console.log
      peerConnection.current.onicecandidate = (event) => {
        console.log("onIceCandidate local: ", event.candidate);
        const candidate = event.candidate;
        if (candidate && signalingChannel.current?.isChannelOpen()) {
          signalingChannel.current?.sendJSON({
            command: "takeCandidate",
            streamId: STREAM_ID,
            label: candidate.sdpMLineIndex.toString(),
            id: candidate.sdpMid,
            candidate: candidate.candidate,
          })
        }
      }

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      console.log("local description is set");

      if (!signalingChannel.current) {
        signalingChannel.current = new SignalingChannel(config.SIGNALING_URL, {
          onOpen: () => {
            console.log("open called");
            signalingChannel.current?.sendJSON({
              command: "publish",
              streamId: STREAM_ID,
            })
          },
          start: () => {
            console.log("start called")
            signalingChannel.current?.sendJSON({
              command: "takeConfiguration",
              streamId: STREAM_ID,
              type: "offer",
              sdp: offer.sdp,
            })
          },
          stop: () => {
            console.log("stop called")
          },
          takeCandidate: (data) => {
            console.log("onIceCandidate remote: ", data);
            peerConnection.current?.addIceCandidate({
              candidate: data?.candidate || "",
              sdpMLineIndex: Number(data?.label) || 0,
              sdpMid: data?.id || "",
            })
          },
          takeConfiguration: (data) => {
            console.log("got answer")
            const answer = data?.sdp || "";
            peerConnection.current?.setRemoteDescription({
              sdp: answer,
              type: "answer"
            })
          }
        })
      }

    }

    initConnection();

  }, [localStream])

  useEffect(() => {
    const getStream = async () => {
      let sourceId;
      const sourceInfos = await mediaDevices.enumerateDevices()
      for (const info of sourceInfos) {
        if (info.kind == "videoinput" && info.facing == isFrontCamera ? "user" : "environment") {
          sourceId = info.deviceId;
        }
      }

      const media = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          mandatory: {
            minFrameRate: 30,
            minHeight: Dimensions.get("window").height,
            minWidth: Dimensions.get("window").width,
          },
          optional: sourceId
        }
      })

      if (media) {
        setLocalStream(media as MediaStream)
      }
    }

    getStream();
  }, [isFrontCamera])

  return (
    <View style={StyleSheet.absoluteFill}>
      {!!localStream &&
        <RTCView streamURL={localStream?.toURL()} style={{ flex: 1 }} objectFit="cover" />
      }
    </View>
  );
};

export default App;
