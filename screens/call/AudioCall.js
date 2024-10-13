import React, {useState, useRef, useEffect} from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Button from "./Button";
import GettingCall from "./GettingCall";
import Video from "./Video";
import { RTCPeerConnection, MediaStream, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import Utils from "./Utils";
import { setDoc, doc, addDoc, collection, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import db from './../../others/FBSetup';


const configuration = {
	iceServers: [
		{
			urls: 'stun:stun.l.google.com:19302'
		}
	]
};

let sessionConstraints = {
	mandatory: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true,
		VoiceActivityDetection: true
	}
};

export default AudioCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [gettingCall, setGettingCall] = useState(false);
  const pc = useRef(new MediaStream());
  const connecting = useRef(false);

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
        // console.log('Adding local track:', track);
        pc.current.addTrack(track, stream);
      });
    }

    pc.current.oniceconnectionstatechange = (event) => {
      console.log('ICE connection state:', pc.current.iceConnectionState);
    };

    pc.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      // if (remoteStream) {
      // console.log('Remote stream received:', remoteStream);
      setRemoteStream(remoteStream); // Ensure you update the state with the remote stream
      // }
    };
  };
  const create = async () => {
    // console.log('Calling...');
    connecting.current = true;

    await setupWebRtc();

    const cRef = doc(collection(db, 'meet'), 'chatId');

    collectIceCandidates(cRef, 'caller', 'callee');

    if (pc.current){
      const offer = await pc.current.createOffer(sessionConstraints)
      pc.current.setLocalDescription(offer);

      const cWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      }

      // cRef.set(cWithOffer);
      // await setDoc(cRef, cWithOffer);
      try {
        await setDoc(cRef, cWithOffer);
        console.log("Chat created successfully");
      } catch (error) {
          console.error("Error creating chat: ", error);
      }
    }

  };

  const join = async () => {
    try {
      console.log('Joining the call...');
      connecting.current = true;
      setGettingCall(false);
  
      // Get the document reference and the offer data
      const cRef = doc(collection(db, 'meet'), 'chatId');
      const docSnapshot = await getDoc(cRef);
      const offerData = docSnapshot.data()?.offer;
  
      // Ensure offer data exists
      if (!offerData || !offerData.sdp || !offerData.type) {
        console.error('Invalid offer data:', offerData);
        return;
      }
  
      // console.log('Offer received:', offerData);
  
      await setupWebRtc(); // Initialize WebRTC
  
      // Collect ICE candidates for callee and caller
      collectIceCandidates(cRef, 'callee', 'caller');
  
      if (pc.current) {
        // Set the remote description with the received offer
        const offer = new RTCSessionDescription({
          type: offerData.type,
          sdp: offerData.sdp,
        });
        await pc.current.setRemoteDescription(offer);
  
        // Create an answer for the call
        const answer = await pc.current.createAnswer(sessionConstraints);
        await pc.current.setLocalDescription(answer);
  
        // Log the created answer
        // console.log('Answer created:', answer);
  
        // Prepare the answer data to update Firestore
        const cWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        };
  
        // Update Firestore with the answer
        await updateDoc(cRef, cWithAnswer);
        // console.log('Answer sent to Firestore');
      }
    } catch (error) {
      console.error('Error during join call:', error);
    }
  };
  

  const hangUp = async () => {
    setGettingCall(false);
    connecting.current = false;
    // streamCleanUp();
    // firestoreCleanUp();
    if (pc.current){
      pc.current.close();
    };
  };

  const streamCleanUp = async () => {
    if (localStream){
      localStream.getTracks(track => track.stop());
      // localStream.release();
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const firestoreCleanUp = async () => {
    const cRef = doc(collection(db, 'meet'), 'chatId');
    if (cRef){
      const calleeCandidate = collection(cRef, 'callee');
      const deleteCalleePromises = calleeCandidate.docs.map(async (candidate) => {
          await candidate.ref.delete();
      });
      await Promise.all(deleteCalleePromises);

      const callerCandidate = collection(cRef, 'caller');
      const deleteCallerPromises = callerCandidate.docs.map(async (candidate) => {
          await candidate.ref.delete();
      });
      await Promise.all(deleteCallerPromises);

      await deleteDoc(cRef);
    }
  };

  const collectIceCandidates = async (cRef, localName, remoteName) => {
    // Create references to the local and remote candidate collections
    const localCandidateCollection = collection(db, `meet/${cRef.id}/${localName}`);
    const remoteCandidateCollection = collection(db, `meet/${cRef.id}/${remoteName}`);

    if (pc.current) {
        pc.current.onicecandidate = (event) => {
          console.log('ICE candidate generated:', event.candidate);
            if (event.candidate) {
                // Add the ICE candidate to the local candidate collection
                addDoc(localCandidateCollection, event.candidate.toJSON());
            }
        };
    }

    // Listen for changes in the remote candidates collection
    onSnapshot(remoteCandidateCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                pc.current?.addIceCandidate(candidate);
            }
        });
    });
  };


  if (gettingCall){
    return <GettingCall join={join} hangUp={hangUp} />
  }

  if (localStream){
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
