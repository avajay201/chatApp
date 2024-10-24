import React, {useState, useRef, useEffect} from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Button from "./Button";
import GettingCall from "./GettingCall";
import Video from "./Video";
import { RTCPeerConnection, MediaStream, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import Utils from "./Utils";
import { setDoc, doc, addDoc, collection, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import db from '../../others/FBSetup';


const configuration = {
	iceTransportPolicy: 'all',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' } // IPv4-based STUN
  ]
};

let sessionConstraints = {
	mandatory: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true,
		VoiceActivityDetection: true
	}
};

export default VideoCall = () => {
  const [localStream, setLocalStream] = useState(new MediaStream());
  const [remoteStream, setRemoteStream] = useState(new MediaStream());
  const [gettingCall, setGettingCall] = useState(false);
  const pc = useRef(new RTCPeerConnection(configuration));
  const connecting = useRef(false);
  const [callStatus, setCallStatus] = useState('Calling...');

  useEffect(()=>{
    const cRef = doc(collection(db, 'meet'), 'chatId');
    const subscribe = onSnapshot(cRef, (snapshot) => {
      const data = snapshot.data();
      if (pc.current && !pc.current.remoteDescription && data && data.answer){
        pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }

      if (data && data.offer && !connecting.current){
        setGettingCall(true);
      }
    });

    const calleeCollectionRef = collection(cRef, 'callee');
    const subscribeDelete = onSnapshot(calleeCollectionRef, (snapshot) => {
      snapshot.docChanges().forEach(change =>{
        if (change.type == 'removed'){
          hangUp();
        }
      });
    });

    return ()=>{
      subscribe();
      subscribeDelete();
    }
  }, []);
  
  const setupWebRtc = async () => {
    pc.current = new RTCPeerConnection(configuration);
    const stream = await Utils.getStream()
    if (stream){
      setLocalStream(stream);
      stream.getTracks().forEach(track => {
        pc.current.addTrack(track, stream);
      });
    }

    pc.current.oniceconnectionstatechange = (event) => {
      // console.log('ICE connection state:', pc.current.iceConnectionState);
    };

    pc.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream); // Ensure you update the state with the remote stream
    };
  };
  const create = async () => {
    connecting.current = true;

    await setupWebRtc();

    const cRef = doc(collection(db, 'meet'), 'chatId');

    collectIceCandidates(cRef, 'caller', 'callee');

    if (pc.current){
      const offer = await pc.current.createOffer();
      pc.current.setLocalDescription(offer);

      const cWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      }

      try {
        await setDoc(cRef, cWithOffer);
        // console.log("Chat created successfully");
      } catch (error) {
        // console.log("Error creating chat: ", error);
      }
    }

  };

  const join = async () => {
    try {
      // console.log('Joining the call...');
      connecting.current = true;
      setGettingCall(false);
  
      // Get the document reference and the offer data
      const cRef = doc(collection(db, 'meet'), 'chatId');
      const docSnapshot = await getDoc(cRef);
      const offer = docSnapshot.data()?.offer;

      if (offer){
        await setupWebRtc();

        collectIceCandidates(cRef, 'callee', 'caller');

        if (pc.current) {
          pc.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.current.createAnswer();
          pc.current.setLocalDescription(answer);
          const cWithAnswer = {
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
          };
          updateDoc(cRef, cWithAnswer);
        }
      }
      else{
        // console.log('Joining offer not found!');
      }
  
    } catch (error) {
      // console.log('Error during join call:', error);
    }
  };
  

  const hangUp = async () => {
    setGettingCall(false);
    connecting.current = false;
    if (pc.current){
      pc.current.close();
    };
    streamCleanUp();
    firestoreCleanUp();
  };

  const streamCleanUp = async () => {
    if (localStream){
      localStream.getTracks(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const firestoreCleanUp = async () => {
    const cRef = doc(collection(db, 'meet'), 'chatId');
    if (cRef){
      try{
        const calleeCandidate = collection(cRef, 'callee');
        const deleteCalleePromises = calleeCandidate?.docs?.map(async (candidate) => {
            await candidate.ref.delete();
        });
        await Promise.all(deleteCalleePromises);
  
        const callerCandidate = collection(cRef, 'caller');
        const deleteCallerPromises = callerCandidate?.docs?.map(async (candidate) => {
            await candidate.ref.delete();
        });
        await Promise.all(deleteCallerPromises);
  
        await deleteDoc(cRef);
      }
      catch(error){
        // console.log('Getting error while firestore cleaning:', error);
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
        else{
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


  if (gettingCall){
    return <GettingCall join={join} hangUp={hangUp} />
  }
  // console.log('localStream>>>', localStream);
  if (localStream && localStream._tracks.length > 0){
    return(
      <>
        <Video
        hangUp={hangUp}
        localStream={localStream}
        remoteStream={remoteStream}
        />
      </>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <Button iconName='video' backgroundColor='grey' onPress={create} />
      </View>
    </>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
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
});
