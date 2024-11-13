import React from "react";
import { View, StyleSheet } from "react-native";
import Button from "./Button";

export default GettingCall = (props) => {
    return (
        <View style={styles.container}>
            <View style={styles.bContainer}>
                <Button
                    iconName="phone"
                    backgroundColor="green"
                    onPress={props.join}
                    style={[styles.circleButton, { marginRight: 30 }]}
                />
                <Button
                    iconName="phone"
                    backgroundColor="red"
                    onPress={props.hangUp}
                    style={[styles.circleButton, { marginLeft: 30 }]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bContainer: {
        flexDirection: 'row',
        bottom: 30,
    },
    circleButton: {
        width: 60,              
        height: 60,             
        borderRadius: 30,        
        justifyContent: 'center',
        alignItems: 'center',
    },
});
