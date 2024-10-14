import React from "react";
import { View, Text, StyleSheet, Alert, ToastAndroid } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute } from "@react-navigation/native";

const Payment = () => {
  const route = useRoute();
  const { paymentUrl } = route.params;

  const handlePayment = (e)=>{
    console.log('Payment output:', e);
  }

  return (
    <View style={styles.container}>
      {paymentUrl ? (
        <WebView
          source={{
            uri: paymentUrl,
          }}
          style={{ flex: 1 }}
          onNavigationStateChange={(event) => handlePayment(event)}
        />
      ) : (
        <Text>Loading PayU payment page...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginTop: 50,
  },
});

export default Payment;
