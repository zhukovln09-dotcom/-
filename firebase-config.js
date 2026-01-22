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
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase инициализирован успешно!");
} catch (error) {
    console.error("Ошибка инициализации Firebase:", error);
}

// Инициализация сервисов
let auth, db;
try {
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Сервисы Firebase загружены!");
} catch (error) {
    console.error("Ошибка загрузки сервисов Firebase:", error);
    // Для демонстрации создаем заглушки
    auth = {
        currentUser: null,
        signInWithEmailAndPassword: () => Promise.reject("Firebase не загружен"),
        createUserWithEmailAndPassword: () => Promise.reject("Firebase не загружен"),
        signOut: () => Promise.reject("Firebase не загружен"),
        onAuthStateChanged: (callback) => {
            callback(null);
            return () => {};
        }
    };
    
    db = {
        collection: () => ({
            add: () => Promise.reject("Firebase не загружен"),
            get: () => Promise.reject("Firebase не загружен"),
            doc: () => ({
                update: () => Promise.reject("Firebase не загружен"),
                delete: () => Promise.reject("Firebase не загружен")
            })
        })
    };
}

// Экспортируем для использования в других файлах
window.firebaseAuth = auth;
window.firebaseDb = db;
