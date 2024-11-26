import axios from "axios";
import { ENDPOINTS } from "./API";
import AsyncStorage from "@react-native-async-storage/async-storage";


const getToken = async()=>{
    const token = await AsyncStorage.getItem('auth_token');
    return token
};

export const userRegister = async(data)=>{
    try{
        const response = await axios.post(ENDPOINTS.register, data);
        return [201, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data];
        };
    }
};

export const userLogin = async(data)=>{
    try{
        const response = await axios.post(ENDPOINTS.login, data);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const userProfile = async()=>{
    try{
        const authToken = await getToken();
        const response = await axios.get(ENDPOINTS.profile, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const updateUserProfile = async(data)=>{
    try{
        const authToken = await getToken();
        const response = await axios.patch(ENDPOINTS.profile, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const userChats = async()=>{
    try{
        const authToken = await getToken();
        const response = await axios.get(ENDPOINTS.chats, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const userMessages = async(data)=>{
    try{
        const authToken = await getToken();
        const response = await axios.post(ENDPOINTS.messages, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const sendMediaMessage = async(data)=>{
    try{
        const authToken = await getToken();
        const response = await axios.post(ENDPOINTS.sendMessage, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return [201, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const messageDelete = async(data)=>{
    try{
        const authToken = await getToken();
        const response = await axios.post(ENDPOINTS.messageDelete, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const clearChat = async(data)=>{
    try{
        const authToken = await getToken();
        await axios.post(ENDPOINTS.clearChat, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [200, []];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const blockUser = async(data)=>{
    try{
        const authToken = await getToken();
        await axios.post(ENDPOINTS.blockUser, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [200, []];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const reportUser = async(data)=>{
    try{
        const authToken = await getToken();
        await axios.post(ENDPOINTS.reportUser, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [201, []];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const searchUser = async(user_id, customID)=>{
    try{
        const response = await axios.get(`${ENDPOINTS.searchUser}?custom_id=${customID}&user_id=${user_id}`);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const searchGifs = async(query)=>{
    try{
        const response = await axios.get(`${ENDPOINTS.searchGifs}&q=${query}`);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const getSubcriptions = async()=>{
    try{
        const response = await axios.get(ENDPOINTS.subscriptions);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const userSuggestions = async(data)=>{
    try{
        const response = await axios.get(`${ENDPOINTS.userSuggestions}/?family_name=${data.family_name}&living_in=${data.living_in}&religion=${data.religion}`);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const subscriptionPayment = async(data)=>{
    try{
        const response = await axios.get(`${ENDPOINTS.subscriptionPayment}/?subscription_id=${data.subscription_id}&user_id=${data.user_id}&price=${data.price}`);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const subscriptionPaymentCreate = async(data)=>{
    try{
        const response = await axios.post(ENDPOINTS.subscriptionPaymentCreate, data);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const applyCoupon = async(coupon)=>{
    try{
        const response = await axios.get(`${ENDPOINTS.applyCoupon}/${coupon}`);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const addOns = async()=>{
    try{
        const response = await axios.get(ENDPOINTS.addOns);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const userProfileData = async()=>{
    try{
        const response = await axios.get(ENDPOINTS.userProfile);
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const messageNotifications = async()=>{
    try{
        const authToken = await getToken();
        const response = await axios.get(ENDPOINTS.notifications, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const createCall = async(data)=>{
    try{
        const authToken = await getToken();
        const response = await axios.post(ENDPOINTS.calls, data, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};

export const getCalls = async()=>{
    try{
        const authToken = await getToken();
        const response = await axios.get(ENDPOINTS.calls, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        });
        return [200, response.data];
    }
    catch(error){
        if (error.response?.data){
            return [error.response?.status, error.response?.data?.detail];
        };
    }
};
