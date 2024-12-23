import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RTCView } from "react-native-webrtc";
import Icon from 'react-native-vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';


const ButtonContainer = (props) => {
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.micButton} onPress={props.toggleMic}>
                <Icon name={`mic${props.isMic ? "" : "-off"}`} size={30} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity disabled={props.remoteStream?._tracks?.length === 0 ? true : false} style={styles.speakerButton} onPress={props.toggleSpeaker}>
                <Icon name={`volume-${props.isSpeaker ? "high" : "low"}`} size={30} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.callEnd} onPress={props.hangUp}>
                <FontAwesomeIcon name="phone" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default Audio = (props) => {
    if (props.remoteStream?._tracks?.length > 0 && !props.callTimer && !props.isConnected){
        props.startTimer();
        props.setIsConnected(true);
    }

    return (
        <View style={styles.container}>
            {props.localStream && props.remoteStream?._tracks?.length === 0 ?
                <>
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
                </>
                :
                <>
                    {props.localStream && props.remoteStream ?
                        <>
                            <RTCView streamURL={props.remoteStream?.toURL()}
                                objectFit={"cover"}
                                style={styles.video}
                            />
                            <RTCView streamURL={props.localStream?.toURL()}
                                objectFit={"cover"}
                                style={styles.videoLocal}
                            />
                        </>
                        :
                        null}
                </>
            }
            <ButtonContainer
                hangUp={props.hangUp}
                toggleSpeaker={props.toggleSpeaker}
                toggleMic={props.toggleMic}
                isSpeaker={props.isSpeaker}
                isMic={props.isMic}
                remoteStream={props.remoteStream}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'black',
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
        position: 'absolute',
        top: 80, // Adjust this value as needed
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    callStatusText: {
        fontSize: 15,
        color: 'white',
        fontWeight: 'bold',
    },
    userNameContainer: {
        position: 'absolute',
        top: 50, // Adjust this value as needed
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    userNameText: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    switchButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        elevation: 5,
    },
    speakerButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        elevation: 5,
    },
    videoButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        elevation: 5,
    },
    micButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        elevation: 5,
    },
    callEnd: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 30,
        elevation: 5,
    },
});
