import React, { createContext, useEffect, useRef, useState } from 'react';
import { G_SOCKET_URL } from '../actions/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import db from '../others/FBSetup';
import IncomingCall from '../screens/call/IncomingCall';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


export const MainContext = createContext(null);

export const MainProvider = ({ children }) => {
  const gChatWS = useRef(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [wsData, setWSData] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [gettingCall, setGettingCall] = useState(false);
  const [callPicked, setCallPicked] = useState(false);

  const configuration = {
    iceTransportPolicy: 'all',
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  };

  const pc = useRef(new RTCPeerConnection(configuration));
  const connecting = useRef(false);

  const fetchAuth = async()=>{
    try {
      const auth_user = await AsyncStorage.getItem("auth_user");
      const auth_token = await AsyncStorage.getItem("auth_token");
      if (!auth_user || !auth_token) {
        return;
      }
      setUser(auth_user);
      setToken(auth_token);
    } catch (error) {
      console.error('Error fetching auth data:', error);
    }
  };

  useEffect(()=>{
    if (isLogged && isLogged != 'logout'){
      fetchAuth();
    }
  }, [isLogged]);

  useEffect(()=>{
    if (!isLogged){
      return;
    }

    // detect call
    const cRef = doc(collection(db, 'meet'), 'chatId');
    const subscribe = onSnapshot(cRef, (snapshot) => {
      const data = snapshot.data();
      if (pc.current && !pc.current.remoteDescription && data && data.answer){
        pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
      console.log('data>>>>', data, 'connecting.current>>>', connecting.current);
      if (data && data.offer && !connecting.current && !callPicked){
        setGettingCall(true);
        console.log('*************Call comming*****************');
      }
    });

    const calleeCollectionRef = collection(cRef, 'callee');
    const subscribeDelete = onSnapshot(calleeCollectionRef, (snapshot) => {
      snapshot.docChanges().forEach(change =>{
        if (change.type == 'removed'){
          console.log('********Call cut from user********');
          // hangUp();
        }
      });
    });

    return ()=>{
      subscribe();
      subscribeDelete();
    }
  }, [isLogged]);

  // Global socket start
  useEffect(()=>{
    console.log('Token:', token, 'User:', user, 'Loging:', isLogged, 'gChatWS.current>>>', gChatWS.current);
    if (isLogged === 'logout' || !isLogged || !user || !token || gChatWS.current){
      return
    }
    console.log('Global WS connecting...');

    gChatWS.current = new WebSocket(`${G_SOCKET_URL}/${token}/`);

    gChatWS.current.onopen = () => {
      console.log('G WS connected');
      ToastAndroid.show('connected', ToastAndroid.SHORT);
    };

    gChatWS.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setWSData(messageData);
      console.log("Msg received from global server(context):", messageData);
    };

    gChatWS.current.onclose = () => {
      console.log('G WS dis-connected');
      ToastAndroid.show('dis-connected', ToastAndroid.SHORT);
      gChatWS.current = null;
    };

    return () => {
      if (gChatWS.current){
        gChatWS.current.close();
      }
    };
  }, [user, token, isLogged]);
  // Global socket end

  const handleAnswer = () => {
    setGettingCall(false);
    // Implement your answer logic here
    console.log('Call answered');
    setCallPicked(true);

    // navigation.navigate('VideoCall', { userName: "avajay202", user: user });
  };
  
  const handleDecline = () => {
    setGettingCall(false);
    // Implement your decline logic here
    console.log('Call declined');
  };

  // return (
  //   <MainContext.Provider value={{wsData, isLogged, setIsLogged, configuration, pc, connecting}}>
  //     {children}
  //   </MainContext.Provider>
  // );
  return (
    <MainContext.Provider value={{ wsData, isLogged, setIsLogged, configuration, pc, connecting, callPicked, setCallPicked }}>
      {gettingCall ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <IncomingCall onAnswer={handleAnswer} onDecline={handleDecline} userName={"avajay202"} />
        </GestureHandlerRootView>
      ) : (
        children
      )}
    </MainContext.Provider>
  );
};
