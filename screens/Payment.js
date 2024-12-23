import React from "react";
import { View, Text, StyleSheet, Alert, ToastAndroid } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute } from "@react-navigation/native";
import { subscriptionPaymentCreate } from './../actions/APIActions';


const Payment = ({ navigation }) => {
  const route = useRoute();
  const { paymentUrl, coupon, subscription_id, addons } = route.params;

  const paymentStatusSave = async(url)=>{
    const data = {payment_url: url, coupon: coupon, subscription_id: subscription_id, addons: addons};
    const result = await subscriptionPaymentCreate(data);
    if (result[0] === 200){
      return;
    }
    if (result[0] === 201){
      ToastAndroid.show('Subscription purchased successfully.', ToastAndroid.SHORT);
      navigation.navigate('Home');
    }
    else{
      ToastAndroid.show('Subscription purchased failed.', ToastAndroid.LONG);
      navigation.navigate('Home');
    }
  }

  const handlePayment = async(e)=>{
    const url = e?.url;
    console.log('url>>>', url);
    if (url.includes('test.payu.in') && url.includes('CommonPgResponseHandler')){
      await paymentStatusSave(url);
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
