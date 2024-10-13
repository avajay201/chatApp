import { mediaDevices } from "react-native-webrtc";

export default class Utils {
    static async getStream(){
        let isFront = true;
        const sourceInfos = await mediaDevices.enumerateDevices();
        // console.log('sourceInfos>>>', sourceInfos);
        let videoSourceId;
        for (let i=0; i < sourceInfos.lenght; i++){
            const sourceInfo = sourceInfos[i];
            if (sourceInfo.kind == 'videoinput' && sourceInfo.facing == (isFront ? 'front' : 'environment')){
                videoSourceId = sourceInfo.deviceId;
            }
        };

        const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: 640,
                heigth: 480,
                frameRate: 30,
                facingMode: (isFront ? 'user' : 'environment'),
                deviceId: videoSourceId
            }
        });
        // console.log('stream from Class base>>>>>>>***************', stream);

        if (typeof stream != 'boolean') return stream;
        return null;
    }
}