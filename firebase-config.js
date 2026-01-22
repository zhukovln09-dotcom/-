// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCtxtlRNWJMAeP7XP8qigh58RVW7xycdTs",
    authDomain: "iamvery-619e2.firebaseapp.com",
    projectId: "iamvery-619e2",
    storageBucket: "iamvery-619e2.firebasestorage.app",
    messagingSenderId: "255451655193",
    appId: "1:255451655193:web:a4be0ca1ef2902d37a8e88"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Инициализация сервисов
const auth = firebase.auth();
const db = firebase.firestore();
