import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCDL06y0oU0yR0XJtAFKtbPqNwRJAoWmTQ",
    authDomain: "metrichat-adb11.firebaseapp.com",
    projectId: "metrichat-adb11",
    storageBucket: "metrichat-adb11.appspot.com",
    messagingSenderId: "749481877329",
    appId: "1:749481877329:android:e05be9a87738963127bd70",
};
  
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default db;
