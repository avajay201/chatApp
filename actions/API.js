export const BASE_URL = 'http://192.168.75.200:8000';
export const SOCKET_URL = 'ws://192.168.75.200:8000/mchat/chat';
export const G_SOCKET_URL = 'ws://192.168.75.200:8000/mchat/g_chat';
export const AC_SOCKET_URL = 'ws://192.168.75.200:8000/mcall/call';
export const METRI_URL = 'https://coorgimangala.com/api';
export const USER_SUGGESTION_URL = 'http://192.168.1.111:8001';
export const METRI_MEDIA_URL = 'https://coorgimangala.com';
export const GIF_API = 'https://tenor.googleapis.com/v2/search';

export const GIF_API_KEY = 'AIzaSyB7P7kHmbX_UhVsXE2noGcA9GtQakAWjW8';

export const ENDPOINTS = {
    register: BASE_URL + '/user/register/',
    login: BASE_URL + '/user/login/',
    profile: BASE_URL + '/user/profile/',
    chats: BASE_URL + '/chat/chats/',
    messages: BASE_URL + '/chat/messages/',
    sendMessage: BASE_URL + '/chat/send-message/',
    messageDelete: BASE_URL + '/chat/message-delete/',
    clearChat: BASE_URL + '/chat/clear-chat/',
    blockUser: BASE_URL + '/chat/block-user/',
    reportUser: BASE_URL + '/chat/report-user/',
    searchUser: METRI_URL + '/custom_user/search_by_custom_id/',
    searchGifs: GIF_API + `/?key=${GIF_API_KEY}&client_key=my_test_app&limit=10&pos=20`,
    subscriptions: USER_SUGGESTION_URL + '/subscriptions/',
    userSuggestions: USER_SUGGESTION_URL + '/api/filter-users',
    subscriptionPayment: USER_SUGGESTION_URL + '/make-payment',
    subscriptionPaymentCreate: USER_SUGGESTION_URL + '/payment/details/',
    applyCoupon: USER_SUGGESTION_URL + '/coupon',
    addOns: USER_SUGGESTION_URL + '/addons/',
    userProfile: METRI_MEDIA_URL + '/profiles/1/',
    notifications: BASE_URL + '/chat/notifications/',
    calls: BASE_URL + '/calls/list-calls/',
};