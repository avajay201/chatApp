import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const IncomingCall = ({ onAnswer, onDecline, userName }) => {
  const translateXAnswer = useRef(new Animated.Value(0)).current;
  const translateXDecline = useRef(new Animated.Value(0)).current;
  const arrowOpacityAnswer = useRef(new Animated.Value(1)).current;
  const arrowOpacityDecline = useRef(new Animated.Value(1)).current;

  const handleGesture = (gesture, action, direction) => {
    if (direction === "right" && gesture.nativeEvent.translationY < -80) {
      action();
    } else if (direction === "left" && gesture.nativeEvent.translationY < -80) {
      action();
    }
  };

  const handleGestureStateChange = (gesture, translateX) => {
    if (gesture.nativeEvent.state === State.END) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const startArrowAnimation = (arrowOpacity) => {
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

  startArrowAnimation(arrowOpacityAnswer);
  startArrowAnimation(arrowOpacityDecline);

  const firstCharacter = userName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.callHeader}>
        <Text style={styles.callComingText}>{userName}</Text>
        <Text style={styles.callType}>Audio Call</Text>
      </View>
      
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{firstCharacter}</Text>
        </View>
      </View>

      <View style={styles.callActionsContainer}>
        <View style={styles.buttonContainer}>
          <Animated.View style={[styles.arrow, { opacity: arrowOpacityAnswer }]}>
            <Text style={styles.arrowText}>↑</Text>
          </Animated.View>

          <PanGestureHandler
            onGestureEvent={(gesture) =>
              handleGesture(gesture, onAnswer, "right")
            }
            onHandlerStateChange={(gesture) =>
              handleGestureStateChange(gesture, translateXAnswer)
            }
          >
            <Animated.View
              style={[
                styles.answerButton,
                { transform: [{ translateX: translateXAnswer }] },
              ]}
            >
              <Text style={styles.buttonText}>Answer</Text>
            </Animated.View>
          </PanGestureHandler>
        </View>

        <View style={styles.buttonContainer}>
          <Animated.View style={[styles.arrow, { opacity: arrowOpacityDecline }]}>
            <Text style={styles.arrowText}>↑</Text>
          </Animated.View>

          <PanGestureHandler
            onGestureEvent={(gesture) =>
              handleGesture(gesture, onDecline, "left")
            }
            onHandlerStateChange={(gesture) =>
              handleGestureStateChange(gesture, translateXDecline)
            }
          >
            <Animated.View
              style={[
                styles.declineButton,
                { transform: [{ translateX: translateXDecline }] },
              ]}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  callHeader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  callComingText: {
    fontSize: 24,
    color: "white",
    marginTop: -40,
    textAlign: "center",
  },
  callType: {
    fontSize: 14,
    color: "white",
    marginTop: 10,
    textAlign: "center",
  },
  logoContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 50,
    color: 'black',
  },
  callActionsContainer: {
    flex: 3,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingBottom: 50,
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    alignItems: "center",
  },
  arrow: {
    marginBottom: 5,
  },
  arrowText: {
    fontSize: 30,
    color: "white",
  },
  answerButton: {
    backgroundColor: "green",
    padding: 15,
    margin: 10,
    borderRadius: 50,
    width: 150,
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "red",
    padding: 15,
    margin: 10,
    borderRadius: 50,
    width: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default IncomingCall;
