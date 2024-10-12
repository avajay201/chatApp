import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";


const SubscriptionPage = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      price: 999,
      subscription_name: "Premium",
      description: "Basic Plan",
      payment_url: "https://pmny.in/hrAjlwHUt5Vq",
    },
    {
      id: 2,
      price: 99,
      subscription_name: "Daily Plan",
      description: "Onboarding Verification for Bank vs Profile name.",
      payment_url: "https://pmny.in/CJU4OUg5ZveW",
    },
    {
      id: 3,
      price: 2999,
      subscription_name: "Gold",
      description:
        "* Pay for 3 Months + Get an additional 3 Months\n* Unlimited chat",
      payment_url: null,
    },
    {
      id: 4,
      price: 7999,
      subscription_name: "Diamond",
      description: "* 6 Months + 3 Months\n* Unlimited chat\n* Profile Boost",
      payment_url: null,
    },
    {
      id: 5,
      price: 9999,
      subscription_name: "Platinum",
      description:
        "* Pay for 12 Months and Get additional 6 Months free\n* Unlimited Chat\n* Profile Boost\n* Highlight profiles\n* Spotlight profiles on the top of the search\n* AI Assistant",
      payment_url: null,
    },
    {
      id: 6,
      price: 49999,
      subscription_name: "VIP Package",
      description:
        "* AI-driven astrology filter matches\n* Unlimited Chats and connections",
      payment_url: null,
    },
  ]);

  const handlePayment = (paymentUrl) => {
    if (paymentUrl) {
        navigation.navigate('Payment', { paymentUrl: paymentUrl })
    } else {
      ToastAndroid.show('Failed to use this plan!', ToastAndroid.SHORT);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Choose Your Subscription Plan</Text>

      {subscriptions.map((plan) => (
        <View key={plan.id} style={styles.subscriptionCard}>
          <Text style={styles.subscriptionName}>{plan.subscription_name}</Text>
          <Text style={styles.subscriptionPrice}>₹{plan.price}</Text>
          <Text style={styles.description}>
            {plan.description.replace(/\n/g, " ").replace(/<br>/g, "\n")}
          </Text>

          {plan.payment_url ? (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => handlePayment(plan.payment_url)}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.notAvailable}>
              <Text style={styles.notAvailableText}>Not Available</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
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
});

export default SubscriptionPage;
