import React, { useState, useRef, useEffect, useContext } from "react";
import { View, TouchableOpacity, StyleSheet, Text, ToastAndroid } from "react-native";
import Video from "./Video";
import { RTCPeerConnection, MediaStream, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import Utils from "./Utils";
import { useRoute } from "@react-navigation/native";
import { setDoc, doc, addDoc, collection, onSnapshot, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import db from '../../others/FBSetup';
import { MainContext } from "../../others/MyContext";
import { Audio } from 'expo-av';
import { createCall } from "../../actions/APIActions";
import { CALL_SOCKET_URL } from "../../actions/API";


export default VideoCall = ({ navigation }) => {
  const { configuration, pc, connecting } = useContext(MainContext);
  const route = useRoute();
  const { userName, user, status, user_id } = route.params;
  const [localStream, setLocalStream] = useState(new MediaStream());
  const [remoteStream, setRemoteStream] = useState(new MediaStream());
  const [callStatus, setCallStatus] = useState('Signal Connecting...');
  const [callTime, setCallTime] = useState(0);
  const timerRef = useRef(null);
  const cRef = useRef(null);
  const [isFront, setIsFront] = useState(true);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isVideo, setIsVideo] = useState(true);
  const [isMic, setIsMic] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const callWS = useRef(null);

  useEffect(()=>{
    if (callWS.current){
      return;
    }

    const room_name = [user, userName].sort().join('_');

    callWS.current = new WebSocket(`${CALL_SOCKET_URL}/${room_name}/`);

    callWS.current.onopen = () => {
      console.log("Call WebSocket connected");
    };

    callWS.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received from call server:", data);
      const members = data["member_count"];
      if (members === 1){
        hangUp();
      }
    };

    callWS.current.onclose = () => {
      console.log("Call WebSocket disconnected");
    };

    return () => {
      callWS.current.close();
    };
  }, []);

  const makeCall = async()=>{
    const data = {
      call_type: "Video",
      call_duration: callTime,
      receiver: user_id
    }
    createCall(data);
  }

  const toggleVideo = async ()=>{
    try{
      if (localStream) {
        Utils.stopStream(localStream);
        setLocalStream(null);
        setIsVideo(false);
      }
      else{
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        // Get new stream with the updated camera direction
        const newStream = await Utils.getStream(isFront);
        if (newStream) {
          setLocalStream(newStream);
          pc.current.getSenders().forEach(sender => {
            if (sender.track.kind === 'video') {
              sender.replaceTrack(newStream.getVideoTracks()[0]);
            }
          });
        }
      }
    }
    catch(error){
      console.log('Getting error while toggling video:', error);
    }
  }

  const toggleMic = ()=>{
    try{
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMic;
      });
      setIsMic(!isMic);
    }
    catch(error){
      console.log('Getting error while toggling mic:', error);
    }
  }

  const toggleSpeaker = async () => {
    try {
      setIsSpeaker(!isSpeaker);
      await Audio.setAudioModeAsync({
        // allowsRecordingIOS: true,
        staysActiveInBackground: true,
        // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        // playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: !isSpeaker, // Switch between speaker and earpiece
      });
      console.log(`Speaker ${isSpeaker ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.log('Error toggling speaker:', error);
    }
  };

  async function switchCamera() {
    try {
      setIsFront(!isFront);
      // Stop existing tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      // Get new stream with the updated camera direction
      const newStream = await Utils.getStream(!isFront);
      if (newStream) {
        setLocalStream(newStream);
        pc.current.getSenders().forEach(sender => {
          if (sender.track.kind === 'video') {
            sender.replaceTrack(newStream.getVideoTracks()[0]);
          }
        });
      }
    } catch (error) {
      console.log("Error switching camera:", error);
    }
  }

  const join = async () => {
    try {
      console.log('Joining the call...');
  
      // Get the document reference and the offer data
      cRef.current = doc(collection(db, 'meet'), 'chatId');
      const docSnapshot = await getDoc(cRef.current);
      const offer = docSnapshot.data()?.offer;

      if (offer){
        pc.current = new RTCPeerConnection(configuration);
        const stream = await Utils.getStream()
        if (stream){
          setLocalStream(stream);
          stream.getTracks().forEach(track => {
            pc.current.addTrack(track, stream);
          });
        }
        
        pc.current.ontrack = (event) => {
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
        };

        collectIceCandidates(cRef.current, user, userName);

        if (pc.current) {
          pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.current.createAnswer();
          pc.current.setLocalDescription(answer);
          const cWithAnswer = {
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
            caller: user,
            receiver: userName,
            timestamp: new Date().toISOString(),
            callType: 'video',
          };
          await updateDoc(cRef.current, cWithAnswer);
          connecting.current = true;
        }
      }
      else{
        console.log('Joining offer not found!');
      }
  
    } catch (error) {
      console.log('Error during join call:', error);
    }
  };

  useEffect(()=> {
    if (!userName || !user) {
      ToastAndroid.show('Something went wrong!', ToastAndroid.SHORT);
      navigation.goBack();
      return;
    }
    // console.log('status>>>>>>>>>>>>>>>>>>', status);
    if (status === 'out'){
      callStart();
    }
    if (status === 'in'){
      join();
    }
  }, []);

  const callStart = async () => {
    console.log('Creating the call...');
    pc.current = new RTCPeerConnection(configuration);
    const stream = await Utils.getStream();
    try {
      if (stream) {
        connecting.current = true;
        setLocalStream(stream);

        // Set local stream on track
        stream.getTracks().forEach(track => {
          pc.current.addTrack(track, stream);
        });

        // Set remote stream on track
        pc.current.ontrack = (event) => {
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
        };

        await sendOffer();
      }
      else{
        ToastAndroid.show('Unable to access camera!', ToastAndroid.SHORT);
        navigation.goBack();
      }
    }
    catch (error) {
      setCallStatus('failed');
    }
  };

  const sendOffer = async ()=>{
    cRef.current = doc(collection(db, 'meet'), 'chatId');
    collectIceCandidates(cRef.current, user, userName);
    if (pc.current) {
      const offer = await pc.current.createOffer();
      pc.current.setLocalDescription(offer);

      const cWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
        caller: user,
        receiver: userName,
        timestamp: new Date().toISOString(),
        callType: 'video',
      }

      try {
        await setDoc(cRef.current, cWithOffer);
        // console.log("Chat created successfully");
      } catch (error) {
        // console.log("Error creating chat: ", error);
      }
    }
  };

  const collectIceCandidates = async (cRef, localName, remoteName) => {
    const localCandidateCollection = collection(db, `meet/${cRef.id}/${localName}`);
    const remoteCandidateCollection = collection(db, `meet/${cRef.id}/${remoteName}`);

    if (pc.current) {
      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          // console.log('Local ICE candidate:', event.candidate);
          addDoc(localCandidateCollection, event.candidate.toJSON())
            .then(() => null)
            .catch((error) => null);
        }
        else {
          // console.log('candidate not found!');
        }
      };
    }

    setTimeout(() => {
      onSnapshot(remoteCandidateCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          // console.log('Candidate change received:', change);
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.current?.addIceCandidate(candidate);
          }
        });
      });
    }, 2000);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallTime((prevTime) => prevTime + 1);
    }, 1000);
    setIsConnected(true);
  };

  const hangUp = async () => {
    // console.log('Hangning up call...');
    if (callWS.current){
      callWS.current.close();
    }
    clearInterval(timerRef.current);
    timerRef.current = null;
    await streamCleanUp();
    await deleteFirebaseData();
    connecting.current = false;
    setCallStatus('end');
    if (status === 'out'){
      makeCall();
    }
    // console.log('Hung up call...');
  };

  const deleteFirebaseData = async () => {
    try {
      if (cRef.current) {
        await deleteDoc(cRef.current);
        // console.log('Firebase data deleted successfully');
      }
    } catch (error) {
      // console.log('Error deleting Firebase data:', error);
    }
  };

  const streamCleanUp = async () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.stop());
      localStream.getAudioTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      {((localStream && localStream?._tracks?.length > 0) || !isVideo) && callStatus != 'end' ? (
        <Video
          hangUp={hangUp}
          localStream={localStream}
          remoteStream={remoteStream}
          status={callStatus}
          user={userName}
          switchCamera={switchCamera}
          toggleSpeaker={toggleSpeaker}
          isSpeaker={isSpeaker}
          isVideo={isVideo}
          toggleVideo={toggleVideo}
          isMic={isMic}
          toggleMic={toggleMic}
          callTimer={timerRef.current}
          startTimer={startTimer}
          setIsConnected={setIsConnected}
          isConnected={isConnected}
        />
      ) : callStatus === 'end' ? (
        <View style={styles.container}>
          <View style={styles.callEndFailedCont}>
            <Text style={styles.callEndFailedContText}>Call end!</Text>
            <Text style={styles.callEndFailedContText}>Call Time : {formatTime(callTime)}</Text>
            <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
              <Text>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : callStatus === 'failed' ? (
        <View style={styles.container}>
          <View style={styles.callEndFailedCont}>
            <Text style={styles.callEndFailedContText}>Call failed!</Text>
            <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
              <Text>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: "#800925",
    paddingBottom: 20,
  },
  callButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
  },
  callEndFailedCont: {
    marginBottom: 100,
  },
  callEndFailedContText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  goBack: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 7,
    paddingBottom: 7,
    alignItems: 'center',
    borderRadius: 10,
  }
});
