// Initialize Firebase with the provided configuration
const firebaseConfig = {
      apiKey: "AIzaSyBOxxp0ooghuyRsiUkAVfjqG1Jg6Usy8UM",
      authDomain: "receipts-website.firebaseapp.com",
      projectId: "receipts-website",
      storageBucket: "receipts-website.firebasestorage.app",
      messagingSenderId: "304902484772",
      appId: "1:304902484772:web:985a8ea4e5ba436b40b9b1",
      measurementId: "G-DJ72ZVRKQ4"
    };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Get Firebase Authentication service


window.auth = auth;