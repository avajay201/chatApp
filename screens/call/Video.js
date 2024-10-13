import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "react-native";
import Button from "./Button";
import { RTCView } from "react-native-webrtc";


const ButtonContainer = (props)=>{
    return(
        <>
            <View style={styles.bContainer} >
                <Button iconName="phone" backgroundColor="red" onPress={props.hangUp} />
            </View>
        </>
    )
}

export default Video = (props)=>{
    console.log('Video props>>>', props);
    // console.log('Remote Stream URL:', props.remoteStream?.toURL());
    // console.log('Local Stream URL:', props.localStream?.toURL());
    // console.log('Local Stream ID:', props.localStream?.id);
    // console.log('Remote Stream ID:', props.remoteStream?.id);
    if (props.localStream && !props.remoteStream){
        return(
            <>
                <View style={styles.container}>
                    <RTCView streamURL={props.localStream.toURL()}
                    objectFit={"cover"}
                    style={styles.video}
                    />
                    <ButtonContainer hangUp={props.hangUp} />
                </View>
            </>
        )
    }

    if (props.localStream && props.remoteStream){
        console.log('Remote stream tracks:', props.remoteStream.getTracks());
        return(
            <>
                <View style={styles.container}>
                    <RTCView streamURL={props.localStream.toURL()}
                    objectFit={"cover"}
                    style={styles.video}
                    />
                    <RTCView streamURL={props.remoteStream.toURL()}
                    objectFit={"cover"}
                    style={styles.videoLocal}
                    />
                    <ButtonContainer hangUp={props.hangUp} />
                </View>
            </>
        )
    }
    else {
        console.log('No tracks in remote stream');
    }
    return(
        <>
            <View>
                <Text></Text>
            </View>
        </>
    )
};

const styles = StyleSheet.create({
    bContainer:{
        flexDirection: 'row',
        bottom: 30,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    video: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    videoLocal: {
        position: 'absolute',
        width: 100,
        height: 150,
        top: 0,
        left: 20,
        elevation: 10,
    }
});
