import React, { useState, useCallback, useEffect } from "react";
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
import { applyCoupon, subscriptionPayment, addOns } from './../actions/APIActions';
import { useFocusEffect } from '@react-navigation/native';

const Checkout = ({ route, navigation }) => {
  const { price, id } = route.params;
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(price);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [addons, setAddons] = useState({});
  const [addOnsdata, setAddOnsData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [couponApplied, setCouponApplied] = useState(false);

  const getAddOns = async () => {
    setIsProcessingPayment(true);
    const result = await addOns();
    if (result[0] === 200) {
      setAddOnsData(result[1]);
    }
    setIsProcessingPayment(false);
  };

  useFocusEffect(
    useCallback(() => {
      getAddOns();
    }, [])
  );

  const handleAddonsChange = (addonName, addonPrice) => {
    const isSelected = addons[addonName] || false;
    const newAddons = { ...addons, [addonName]: !isSelected };
    const priceAdjustment = isSelected ? -addonPrice : addonPrice;
    const newTotal = discountedPrice + priceAdjustment;

    setAddons(newAddons);
    setDiscountedPrice(newTotal);
  };

  const handleApplyCoupon = async () => {
    setLoading(true);
    try {
      const result = await applyCoupon(coupon);
      if (result && result[0] === 200) {
        const discount = Number(result[1].discount_percentage);
        
        // Calculate the total price including selected add-ons
        const addonsPrice = Object.keys(addons).reduce((total, addonName) => {
          if (addons[addonName]) {
            const addon = addOnsdata.find(item => item.addon_name === addonName);
            return total + (addon ? addon.price : 0);
          }
          return total;
        }, 0);
  
        const totalPrice = price + addonsPrice;
  
        // Apply discount to the total price
        const discountAmount = (totalPrice * discount) / 100;
        const newPrice = totalPrice - discountAmount;

        setDiscountedPrice(newPrice);
        setCouponApplied(true);
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
      navigation.navigate('Payment', { paymentUrl: result[1].redirect_url, coupon: couponApplied ? coupon : null });
    } else {
      ToastAndroid.show("Sorry! We can't process this subscription at this time.", ToastAndroid.SHORT);
    }
  };

  const openAddonDetails = (addon) => {
    setSelectedAddon(addon);
    setModalVisible(true);
  };

  const closeAddonDetails = () => {
    setModalVisible(false);
    setSelectedAddon(null);
  };

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

      {/* Add-ons Section */}
      {addOnsdata.length > 0 && (
        <View style={styles.addonsContainer}>
          <Text style={styles.addonsTitle}>Add-ons:</Text>
          {addOnsdata.map((addon, index) => (
            <View key={index} style={styles.addonItem}>
              <CheckBox
                isChecked={addons[addon.addon_name] || false}
                onClick={() => handleAddonsChange(addon.addon_name, addon.price)}
              />
              <Text style={styles.addonText}>
                {addon.addon_name}: ₹{addon.price}
              </Text>
              <TouchableOpacity onPress={() => openAddonDetails(addon)}>
                <Text style={styles.seePlanText}>See Plan</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.confirmButton} onPress={handlePurchase}>
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
            {selectedAddon && (
              <>
                <Text style={styles.modalTitle}>{selectedAddon.addon_name}</Text>
                <Text>{selectedAddon.description}</Text>
                <Text>Price: ₹{selectedAddon.price}</Text>
                <Text>Users: {selectedAddon.user_count}</Text>
                <Text>Videos: {selectedAddon.video_count}</Text>
                <Text>Audio: {selectedAddon.audio_count}</Text>
                <Text>Messages: {selectedAddon.special_message}</Text>
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
