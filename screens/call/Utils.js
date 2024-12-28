import { mediaDevices } from "react-native-webrtc";

export default class Utils {
    static async getStream(isFront = true) {
        const sourceInfos = await mediaDevices.enumerateDevices();
        // console.log('sourceInfos>>>', sourceInfos);
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
            const sourceInfo = sourceInfos[i];
            if (
                sourceInfo.kind == "videoinput" &&
                sourceInfo.facing == (isFront ? "front" : "environment")
            ) {
                videoSourceId = sourceInfo.deviceId;
            }
        }

        const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: 640,
                height: 480,
                frameRate: 30,
                facingMode: isFront ? "user" : "environment",
                deviceId: videoSourceId,
            },
        });
        if (typeof stream !== "boolean") return stream;
        return null;
    }
    static stopStream(stream) {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.stop());
        }
    }


    // Audio call
    static async getAudioStream(isAudio=null) {
        console.log('#########################');
        // if (!isAudio) {
        //     return null; // Return null if audio capture is not requested
        // }

        // Get audio stream only
        const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });

        return stream || null; // Return the stream if available, otherwise null
    }
}
