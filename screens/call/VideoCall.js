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


export default VideoCall = ({ navigation }) => {
  const { configuration, pc, connecting } = useContext(MainContext);
  const route = useRoute();
  const { userName, user, status } = route.params;
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

  const toggleVideo = async ()=>{
    try{
      if (localStream) {
        Utils.stopStream(localStream);
        setLocalStream(null);
        setIsVideo(false);
      }
      else{
        // const newStream = await Utils.getStream(true);
        // if (newStream) {
        //   setLocalStream(newStream);
        //   setIsVideo(true);
        //   newStream.getTracks().forEach(track => {
        //     pc.current.addTrack(track, newStream);
        //   });
        // }
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
      // console.log('1111111111111');
      const docSnapshot = await getDoc(cRef.current);
      // console.log('22222222222222');
      const offer = docSnapshot.data()?.offer;
      // console.log('3333333333333');

      if (offer){
        // console.log('444444444444');
        pc.current = new RTCPeerConnection(configuration);
        // console.log('444444444445');
        const stream = await Utils.getStream()
        // console.log('444444444446');
        if (stream){
          setLocalStream(stream);
          stream.getTracks().forEach(track => {
            pc.current.addTrack(track, stream);
          });
        }
        // console.log('444444444447');
        
        pc.current.ontrack = (event) => {
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
        };
        // console.log('444444444448');
        
        collectIceCandidates(cRef.current, user, userName);
        // console.log('444444444449');

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
          };
          // console.log('4444444444410');
          await updateDoc(cRef.current, cWithAnswer);
          // console.log('4444444444411');
          connecting.current = true;
        }
        // console.log('4444444444412');
      }
      else{
        console.log('Joining offer not found!');
      }
  
    } catch (error) {
      console.log('Error during join call:', error);
    }
  };

  useEffect(()=> {
    console.log('userName*****', userName, 'user*****', user);
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

        startTimer();
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
  };

  const hangUp = async () => {
    // console.log('Hangning up call...');
    await streamCleanUp();
    await deleteFirebaseData();
    connecting.current = false;
    setCallStatus('end');
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
    clearInterval(timerRef.current);
    timerRef.current = null;
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
