import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import { mediaDevices, RTCPeerConnection, RTCView, RTCIceCandidate, MediaStream } from 'react-native-webrtc';
import { AC_SOCKET_URL } from './../../actions/API';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";


const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const VideoCall = ({ navigation }) => {
  const route = useRoute();
  const { userName } = route.params;
  const [roomName, setRoomName] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [micPermission, setMicPermission] = useState(false);
  // let [localStream, setLocalStream] = useState(null);
  let localStream = new MediaStream()
  let [remoteStream, setRemoteStream] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const localStreamRef = useRef(new MediaStream());
  let remoteStreamRef = useRef(new MediaStream());
  const callWS = useRef();
  const peerRef = useRef();
  const remoteVideo = useRef();

  const fetchAuth = async () => {
    const auth_user = await AsyncStorage.getItem("auth_user");
    const auth_token = await AsyncStorage.getItem("auth_token");
    if (!auth_user || !auth_token) {
      ToastAndroid.show("Session expired, please login.", ToastAndroid.SHORT);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      navigation.navigate("Login");
      return;
    }

    setUser(auth_user);
    setToken(auth_token);
    if (auth_user && userName) {
      const callName = `${auth_user}__${userName}`;
      setRoomName(callName);
    } else {
      ToastAndroid.show("Something went wrong!", ToastAndroid.SHORT);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAuth();
    }, [])
  );

  useEffect(() => {
    let stream;
    const startVideo = async () => {
      try {
        stream = await mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // setLocalStream(stream);
        localStream = stream;
        setMyStream(stream);

      } catch (error) {
        alert('Media access denied!');
        navigate('/');
      }
    };

    startVideo();

    return () => {
    };
  }, []);

  const wsMessagehandler = (event)=>{
    let parsedData = JSON.parse(event.data);
    let peerUser = parsedData['message']['peer'];
    let action = parsedData['message']['action'];
    // console.log('Message:', parsedData);

    if (user === peerUser) return;
    let receive_channel_name = parsedData['message']['receive_channel_name'];

    if (action === 'new-peer'){
      createOffer(receive_channel_name)
      return;
    }
    else if (action === 'new-offer') {
      receive_channel_name = parsedData.message.message.receive_channel_name;
      const offer = parsedData.message.message.sdp;
      // console.log('New offer>>>>', offer);
      createAnswer(offer, receive_channel_name);
    }
    else if (action === 'new-answer') {
      const answer = parsedData.message.message.sdp;
      // console.log('New answer>>>>', answer);
      peerRef.current.setRemoteDescription(answer);
    }
  };

  const addLocalTracks = (peer)=>{
    localStream.getTracks().forEach(track=>{
      peer.addTrack(track, localStream);
    });
  };

  const setOnTrack = (peer)=>{
    let remoteMediaStream = new MediaStream();
    peer.addEventListener('track', async(event) => {
      // console.log('Tracks found+++++++++++++++++++++++++');
      remoteMediaStream.addTrack(event.track, remoteMediaStream);
      setRemoteStream(remoteMediaStream);
    });
  };

  const createOffer = async(receive_channel_name)=>{
    // console.log('Creating offer...');
    let peer = new RTCPeerConnection(configuration);

    peer.onicegatheringstatechange = () => {
      // console.log('ICE gathering state:', peer.iceGatheringState);
    };

    peer.onconnectionstatechange = () => {
      // console.log('Connection state:', peer.connectionState);
      if (peer.connectionState === 'failed') {
        // console.log('ICE connection failed. Restarting ICE...');
        peer.restartIce();  // Restart ICE when it fails
      }
    };

    peer.addEventListener('icecandidateerror', (event) => {
      // console.log('ICE Candidate Error:', event);
    });

    // localStream.getTracks().forEach((track) => {
    //   peer.addTrack(track, localStream);
    // });

    addLocalTracks(peer);

    setOnTrack(peer);

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        // console.log('New ICE candidate:', event.candidate);
      } else {
        // console.log('All ICE candidates have been gathered.');
        sendSignal('new-offer', {
          sdp: peer.localDescription,
          receive_channel_name: receive_channel_name,
        });
      }
    };

    try {
      const offer = await peer.createOffer(
        {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        }
      );
      await peer.setLocalDescription(offer);
      // peer.restartIce();
      // console.log('Offer created and set:', peer.localDescription);
    } catch (error) {
      // console.log('Error creating or setting offer:', error);
    }

    peerRef.current = peer;

  };

  const createAnswer = async (offer, receiveChannelName) => {
    const peer = new RTCPeerConnection(configuration);
    addLocalTracks(peer);
    setOnTrack(peer);

    peer.onicecandidate = (event) => {
      if (!event.candidate) {
        sendSignal('new-answer', {
          sdp: peer.localDescription,
          receive_channel_name: receiveChannelName,
        });
      }
    };
    try{
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      peerRef.current = peer;
    }
    catch(error){
      // console.log('Error creating or setting answer:', error);
    }
  };

  useEffect(() => {
    if (!micPermission) {
      requestMicrophonePermission();
    }

    if (!roomName || !token || !user || !micPermission || callWS.current) {
      return;
    }

    const ws = new WebSocket(`${AC_SOCKET_URL}/${roomName}/${token}/`);
    ws.onopen = () => {
      callWS.current = ws;
      sendSignal('new-peer', {});
      // console.log('WebSocket connected');
    };

    ws.addEventListener('message', wsMessagehandler);

    ws.onclose = () => {
      // console.log('WebSocket disconnected');
      callWS.current = null;
    };

    return () => {
      ws.close();
    };
  }, [user, token, roomName, micPermission]);

  const requestMicrophonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setMicPermission(true);
        // console.log('Microphone permission granted');
      } else {
        ToastAndroid.show('Microphone permission denied!', ToastAndroid.SHORT);
        navigation.navigate('Home');
      }
    } catch (err) {
      ToastAndroid.show('Microphone permission issue!', ToastAndroid.SHORT);
      navigation.navigate('Home');
    }
  };

  const sendSignal = (action, message)=>{
    if (!callWS.current){
      return;
    }
    let jsonStr = JSON.stringify({
      'peer': user,
      'action': action,
      'message': message,
    });
    callWS.current.send(jsonStr);
  };

  return (
    <View>
      <Text>Video Call</Text>
      {myStream && (
        <RTCView
          streamURL={myStream.toURL()}
          style={{ width: '100%', height: '50%' }} />
      )}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{ width: '100%', height: '50%' }}
          mirror={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default VideoCall;