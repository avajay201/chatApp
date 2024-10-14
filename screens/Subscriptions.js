import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import MyLayout from './MyLayout';
import { getSubcriptions, subscriptionPayment } from './../actions/APIActions';


const SubscriptionPage = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(()=>{
    const allSubscriptions = async()=>{
      const result = await getSubcriptions();
      if (result && result[0] === 200){
        setSubscriptions(result[1]);
      }
      setLoading(false);
    }

    allSubscriptions();
  }, []);

  const handlePayment = async(sub_id) => {
    setIsProcessingPayment(true);
    const data = {subscription_id: sub_id, user_id: 1};
    const result = await subscriptionPayment(data);
    console.log('sub_id>>>', sub_id, 'result>>>', result);
    setIsProcessingPayment(false);
    if (result && result[0] === 200){
      navigation.navigate('Payment', { paymentUrl: result[1].redirect_url });
    }
    else{
      ToastAndroid.show('Sorry! We cann\'t process this subscription at this time.', ToastAndroid.SHORT);
    }
  };

  return (
    <MyLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Choose Your Subscription Plan</Text>

        {subscriptions.length > 0 ? subscriptions.map((plan) => (
            <View key={plan.id} style={styles.subscriptionCard}>
              <Text style={styles.subscriptionName}>{plan.subscription_name}</Text>
              <Text style={styles.subscriptionPrice}>₹{plan.price}</Text>
              <Text style={styles.description}>
                {plan.description.replace(/\n/g, " ").replace(/<br>/g, "\n")}
              </Text>

              {plan.payment_url ? (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={()=>handlePayment(plan.id)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.notAvailable}>
                  <Text style={styles.notAvailableText}>Not Available</Text>
                </View>
              )}
            </View>
          ))
          :
          (!loading && 
          <View style={styles.noSubs}>
            <Text style={styles.noSubsTest}>User not found!</Text>
          </View>)
        }
      </ScrollView>

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#800925" />
        </View>
      )}

      {isProcessingPayment && (
        <View style={styles.blockingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </MyLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 35,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#800925",
    textAlign: "center",
  },
  subscriptionCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    paddingBottom: 30,
  },
  subscriptionName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subscriptionPrice: {
    fontSize: 18,
    color: "#800925",
    marginVertical: 10,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  payButton: {
    backgroundColor: "#800925",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  notAvailable: {
    paddingVertical: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  notAvailableText: {
    fontSize: 16,
    color: "#999",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  noSubs: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  noSubsTest: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  blockingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default SubscriptionPage;
