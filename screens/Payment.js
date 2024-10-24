import React from "react";
import { View, Text, StyleSheet, Alert, ToastAndroid } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute } from "@react-navigation/native";
import { subscriptionPaymentCreate } from './../actions/APIActions';
import axios from "axios";


const Payment = ({ navigation }) => {
  const route = useRoute();
  const { paymentUrl, coupon } = route.params;

  const paymentStatusSave = async(url)=>{
    const data = {payment_url: url, coupon: coupon};
    await subscriptionPaymentCreate(data);
  }

  const handlePayment = async(e)=>{
    const url = e?.url;
    if (url.includes('https://test.payu.in') && url.includes('CommonPgResponseHandler')){
      const response = await axios.get(url);
      if (response.status === 200){
        paymentStatusSave(url);
      }
      else{
        // console.log('Payment failed!') ;
      }
    }
    if (url.includes('cancel?status=cancel')){
      navigation.navigate('Home');
      ToastAndroid.show('Subscription purchase cancelled.', ToastAndroid.SHORT);
    }
    if (url === 'https://test-payment-middleware.payu.in/simulatorResponse'){
      navigation.navigate('Home');
      ToastAndroid.show('Subscription purchased successfully.', ToastAndroid.SHORT);
    }
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
