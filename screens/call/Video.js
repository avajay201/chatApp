import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Button from "./Button";
import { RTCView } from "react-native-webrtc";
import Icon from 'react-native-vector-icons/MaterialIcons';


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
    if (props.localStream && props.remoteStream?._tracks?.length === 0){
        return(
            <>
                <View style={styles.container}>
                    <RTCView streamURL={props.localStream.toURL()}
                    objectFit={"cover"}
                    style={styles.video}
                    />
                    <View style={styles.userNameContainer} >
                        <Text style={styles.userNameText}>{props.user}</Text>
                    </View>
                    <View style={styles.callStatusContainer} >
                        <Text style={styles.callStatusText}>{props.status}</Text>
                    </View>
                    <ButtonContainer hangUp={props.hangUp} />
                    <TouchableOpacity style={styles.switchButton} onPress={props.switchCamera}>
                        <Icon name="switch-camera" size={30} color="#000" />
                    </TouchableOpacity>
                </View>
            </>
        )
    }

    if (props.localStream && props.remoteStream){
        return(
            <>
                <View style={styles.container}>
                    <RTCView streamURL={props.remoteStream.toURL()}
                    objectFit={"cover"}
                    style={styles.video}
                    />
                    <RTCView streamURL={props.localStream.toURL()}
                    objectFit={"cover"}
                    style={styles.videoLocal}
                    />
                    <ButtonContainer hangUp={props.hangUp} />
                    <TouchableOpacity style={styles.switchButton} onPress={props.switchCamera}>
                        <Icon name="switch-camera" size={30} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.speakerButton} onPress={props.toggleSpeaker}>
                        <Icon name="volume-up" size={30} color="#000" />
                    </TouchableOpacity>
                </View>
            </>
        )
    }
};

const styles = StyleSheet.create({
    bContainer:{
        flexDirection: 'row',
        bottom: 50,
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
        top: 50,
        left: 20,
        elevation: 10,
    },
    callStatusContainer: {
        flexDirection: 'row',
        bottom: 70,
    },
    callStatusText: {
        fontSize: 15,
        color: 'green',
        fontWeight: 'bold',
    },
    userNameContainer: {
        flexDirection: 'row',
        bottom: 800,
        backgroundColor: 'black',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 5,
        borderRadius: 15,
    },
    userNameText: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
    },
    switchButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        position: 'absolute',
        top: 50,
        right: 20,
        elevation: 5,
    },
    speakerButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        position: 'absolute',
        bottom: 50,
        left: 20,
        elevation: 5,
    },
});
