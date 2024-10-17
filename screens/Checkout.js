import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { applyCoupon, subscriptionPayment } from './../actions/APIActions';


const Checkout = ({ route, navigation }) => {
  const { price, id } = route.params;
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(price);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleApplyCoupon = async () => {
    setLoading(true);
    try {
      const result = await applyCoupon(coupon);
      if (result && result[0] === 200) {
        const discount = Number(result[1].discount_percentage)
        const discountAmount = (price * discount) / 100;
        const newPrice = price - discountAmount;
        setDiscountedPrice(newPrice);
        ToastAndroid.show('Coupon applied successfully!', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Invalid coupon code!', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error(error);
      ToastAndroid.show('Error applying coupon!', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async()=>{
    setIsProcessingPayment(true);
    const data = {subscription_id: id, user_id: 6, price: discountedPrice};
    const result = await subscriptionPayment(data);
    setIsProcessingPayment(false);
    console.log('result>>>', result);
    if (result && result[0] === 200){
        navigation.navigate('Payment', { paymentUrl: result[1].redirect_url });
    }
    else{
      ToastAndroid.show('Sorry! We cann\'t process this subscription at this time.', ToastAndroid.SHORT);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.priceText}>Price: ₹{discountedPrice}</Text>

      <TextInput
        style={styles.couponInput}
        placeholder="Enter coupon code"
        value={coupon}
        onChangeText={setCoupon}
      />
      <TouchableOpacity style={styles.applyButton} onPress={handleApplyCoupon}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.applyButtonText}>Apply</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton} onPress={handlePurchase}>
        <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
      </TouchableOpacity>

      {isProcessingPayment && (
        <View style={styles.blockingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#800925',
    textAlign: 'center',
  },
  priceText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  couponInput: {
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  applyButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#800925',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
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

export default Checkout;
