import React from "react";
import { View, Text, StyleSheet, Alert, ToastAndroid } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute } from "@react-navigation/native";
import { subscriptionPaymentCreate } from './../actions/APIActions';
import axios from "axios";


const Payment = ({ navigation }) => {
  const route = useRoute();
  const { paymentUrl, coupon, subscription_id, addons } = route.params;

  const paymentStatusSave = async(url)=>{
    const data = {payment_url: url, coupon: coupon, subscription_id: subscription_id, addons: addons};
    await subscriptionPaymentCreate(data);
  }

  const handlePayment = async(e)=>{
    const url = e?.url;
    console.log('url>>>>>>>>>>', url);
    if (url.includes('https://testtxncdn.payubiz.in') && url.includes('mihpayid')){
      const result = await paymentStatusSave(url);
      if (result[0] === 201){
        ToastAndroid.show('Subscription purchased successfully.', ToastAndroid.SHORT);
        navigation.navigate('Home');
      }
      else{
        ToastAndroid.show('Subscription purchased failed. If your money is debited, please contact to our supports team.', ToastAndroid.LONG);
        navigation.navigate('Home');
      }
    }
    if (url.includes('cancel?status=cancel')){
      navigation.navigate('Home');
      ToastAndroid.show('Subscription purchase cancelled.', ToastAndroid.SHORT);
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
