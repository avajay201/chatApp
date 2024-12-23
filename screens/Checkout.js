import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Modal,
} from "react-native";
import CheckBox from "react-native-check-box";
import { applyCoupon, subscriptionPayment } from './../actions/APIActions';

const Checkout = ({ route, navigation }) => {
  const { price, id, addons } = route.params;
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(price);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewAddon, setViewAddon] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [couponApplied, setCouponApplied] = useState(null);


  const handleAddonsChange = (addonId) => {
    resetCoupon();
    setSelectedAddons(prevAddons => {
      if (prevAddons.includes(addonId)) {
        return prevAddons.filter(id => id !== addonId);
      } else {
        return [...prevAddons, addonId];
      }
    });
  };

  useEffect(() => {
    const filteredAddons = addons.filter(addon => selectedAddons.includes(addon.id));
    
    let addonsPrice = 0;
    for (let addon of filteredAddons) {
      addonsPrice += parseFloat(addon.price);
    }
  
    const newPrice = parseFloat(price) + addonsPrice;
    setDiscountedPrice(newPrice);
  }, [selectedAddons, addons, price]);

  const handleApplyCoupon = async () => {
    setLoading(true);
    try {
      const result = await applyCoupon({subscription_id: id, coupon_code: coupon, addons: selectedAddons});
      if (result && result[0] === 200) {
        setDiscountedPrice(result[1].final_total_price);
        setCouponApplied(result[1].discount);
        ToastAndroid.show('Coupon applied successfully!', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Invalid coupon code!', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Error applying coupon!', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsProcessingPayment(true);
    const data = { subscription_id: id, user_id: 6, price: discountedPrice };
    const result = await subscriptionPayment(data);
    setIsProcessingPayment(false);
    if (result && result[0] === 200) {
      navigation.navigate('Payment', { paymentUrl: result[1].redirect_url, coupon: couponApplied ? coupon : null, subscription_id: id, addons: selectedAddons });
    } else {
      ToastAndroid.show("Sorry! We can't process this subscription at this time.", ToastAndroid.SHORT);
    }
  };

  const openAddonDetails = (addon) => {
    setViewAddon(addon);
    setModalVisible(true);
  };

  const closeAddonDetails = () => {
    setModalVisible(false);
    setViewAddon(null);
  };

  const resetCoupon = ()=>{
    setDiscountedPrice(price);
    setCoupon('')
    setCouponApplied(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.priceText}>Price: ₹{discountedPrice}</Text>

      <TextInput
        style={styles.couponInput}
        placeholder="Enter coupon code"
        editable={couponApplied ? false : !loading}
        value={coupon}
        onChangeText={setCoupon}
      />
      <TouchableOpacity disabled={loading || couponApplied ? true : (coupon ? false : true)} style={[styles.applyButton, {backgroundColor: !coupon || loading || couponApplied ? 'gray' : 'green'}]} onPress={handleApplyCoupon}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.applyButtonText}>{couponApplied ? `${couponApplied}% off` : 'Apply'}</Text>
        )}
      </TouchableOpacity>

      {/* Add-ons Section */}
      {addons.length > 0 && (
        <View style={styles.addonsContainer}>
          <Text style={styles.addonsTitle}>Add-ons:</Text>
          {addons.map((addon, index) => (
            <View key={index} style={styles.addonItem}>
              <CheckBox
                isChecked={selectedAddons.includes(addon.id)}
                onClick={() => handleAddonsChange(addon.id)}
                disabled={loading}
              />
              <Text style={styles.addonText}>
                {addon.type === 'message' ? `${addon.messages} messages` : `${addon.calls} minutes calls`}: ₹{addon.price}
              </Text>
              <TouchableOpacity onPress={() => openAddonDetails(addon)}>
                <Text style={styles.seePlanText}>See Plan</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity disabled={loading} style={[styles.confirmButton, {backgroundColor: loading ? 'gray' : '#800925'}]} onPress={handlePurchase}>
        <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
      </TouchableOpacity>

      {isProcessingPayment && (
        <View style={styles.blockingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Modal for Add-on Details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAddonDetails}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {viewAddon && (
              <>
                <Text style={styles.modalTitle}>Addon Plan</Text>
                <Text>Price: ₹{viewAddon.price}</Text>
                <Text>{viewAddon.type === 'message' ? `Message: ${viewAddon.messages}` : `Calls: ${viewAddon.calls} minutes`}</Text>
                <TouchableOpacity onPress={closeAddonDetails} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  addonsContainer: {
    marginVertical: 20,
  },
  addonsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  confirmButton: {
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
  seePlanText: {
    color: 'blue',
    marginLeft: 10,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#800925',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Checkout;
