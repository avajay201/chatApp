import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';


const IncomingCall = ({ onAnswer, onDecline, userName }) => {
  const translateYAnswer = useRef(new Animated.Value(0)).current;
  const translateYDecline = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(1)).current;

  const handleGesture = (gesture, action) => {
    if (gesture.nativeEvent.translationY < -100) {
      action();
    }
  };

  const handleGestureStateChange = (gesture, translateY) => {
    if (gesture.nativeEvent.state === State.END) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const startArrowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(arrowOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  startArrowAnimation();

  return (
    <View style={styles.container}>
      <View style={styles.callHeader}>
        <Text style={styles.callComingText}>Incoming Call from {userName}</Text>
      </View>
      <View style={styles.callActionsContainer}>
        {/* Arrow Animation Above Answer Button */}
        <Animated.View style={[styles.arrow, { opacity: arrowOpacity }]}>
          <Text style={styles.arrowText}>↑</Text>
        </Animated.View>

        {/* Draggable Answer Button */}
        <PanGestureHandler
          onGestureEvent={(gesture) => handleGesture(gesture, onAnswer)}
          onHandlerStateChange={(gesture) => handleGestureStateChange(gesture, translateYAnswer)}
        >
          <Animated.View
            style={[
              styles.answerButton,
              { transform: [{ translateY: translateYAnswer }] },
            ]}
          >
            <Text style={styles.buttonText}>Answer</Text>
          </Animated.View>
        </PanGestureHandler>

        {/* Arrow Animation Above Decline Button */}
        <Animated.View style={[styles.arrow, { opacity: arrowOpacity }]}>
          <Text style={styles.arrowText}>↑</Text>
        </Animated.View>

        {/* Draggable Decline Button */}
        <PanGestureHandler
          onGestureEvent={(gesture) => handleGesture(gesture, onDecline)}
          onHandlerStateChange={(gesture) => handleGestureStateChange(gesture, translateYDecline)}
        >
          <Animated.View
            style={[
              styles.declineButton,
              { transform: [{ translateY: translateYDecline }] },
            ]}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  callHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callComingText: {
    fontSize: 24,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  callActionsContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  arrow: {
    marginBottom: 10,
  },
  arrowText: {
    fontSize: 30,
    color: 'white',
  },
  answerButton: {
    backgroundColor: 'green',
    padding: 15,
    margin: 10,
    borderRadius: 50,
    width: 150,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: 'red',
    padding: 15,
    margin: 10,
    borderRadius: 50,
    width: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default IncomingCall;
