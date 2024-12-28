import React, { createContext, useEffect, useRef, useState } from 'react';
import { G_SOCKET_URL } from '../actions/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [deviceToken, setDeviceToken] = useState(null);
  const [wsData, setWSData] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [numExists, setNumExists] = useState(false);
  const [gettingCall, setGettingCall] = useState(false);
  const [callPicked, setCallPicked] = useState(false);
  const [caller, setCaller] = useState('');

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
      console.log('*************', auth_user, auth_token);
      if (!auth_user || !auth_token) {
        return;
      }
      setUser(auth_user);
      setToken(auth_token);
    } catch (error) {
      // console.log('Error fetching auth data:', error);
    }
  };

  useEffect(()=>{
    if (isLogged && isLogged != 'logout'){
      fetchAuth();
    }
  }, [isLogged]);

  const updateCall = async()=>{
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    await AsyncStorage.setItem('call', 'true');
  };

  useEffect(()=>{
    if (!isLogged || callPicked || !user){
      return;
    }

    // detect call
    const cRef = doc(collection(db, 'meet'), 'chatId');
    console.log('Call detector!!!!!!!!!!!!!!');
    const subscribe = onSnapshot(cRef, (snapshot) => {
      const data = snapshot.data();
      console.log('Data receiving...');
      if (!data){
        return;
      }
      console.log('FB DATA:', Object.keys(data));
      console.log('Caller:', data.caller);
      console.log('Receiver:', data.receiver);
      console.log('User:', user);
      console.log('Call Type:', data.callType);
      if (pc.current && !pc.current.remoteDescription && data && data.answer && data.receiver == user){
        pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
      if (data && data.offer && !connecting.current && data.receiver == user){
        updateCall();
        setCaller({'callType': data.callType, 'userName': data.caller});
        setGettingCall(true);
        // console.log('*************Call comming*****************');
      }
    });

    const calleeCollectionRef = collection(cRef, 'callee');
    const subscribeDelete = onSnapshot(calleeCollectionRef, (snapshot) => {
      snapshot.docChanges().forEach(change =>{
        if (change.type == 'removed'){
          // console.log('********Call cut from user********');
          // hangUp();
        }
      });
    });

    return ()=>{
      subscribe();
      subscribeDelete();
    }
  }, [isLogged, user]);

  // Global socket start
  useEffect(()=>{
    if (isLogged === 'logout' || !isLogged || !user || !token || gChatWS.current){
      return
    }
    console.log('Global WS connecting...');

    gChatWS.current = new WebSocket(`${G_SOCKET_URL}/${token}/`);

    gChatWS.current.onopen = () => {
      console.log('G WS connected');
      // ToastAndroid.show('connected', ToastAndroid.SHORT);
    };

    gChatWS.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setWSData(messageData);
      // console.log("Msg received from global server(context):", messageData);
    };

    gChatWS.current.onclose = () => {
      console.log('G WS dis-connected');
      // ToastAndroid.show('dis-connected', ToastAndroid.SHORT);
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
    // console.log('Call answered');
    setCallPicked(caller);
  };

  const handleDecline = () => {
    setGettingCall(false);
    // console.log('Call declined');
  };

  return (
    <MainContext.Provider value={{ wsData, isLogged, setIsLogged, configuration, pc, connecting, callPicked, setCallPicked, deviceToken, setDeviceToken, numExists, setNumExists }}>
      {gettingCall ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <IncomingCall onAnswer={handleAnswer} onDecline={handleDecline} userName={caller?.userName} callType={caller?.callType} />
        </GestureHandlerRootView>
      ) : (
        children
      )}
    </MainContext.Provider>
  );
};
