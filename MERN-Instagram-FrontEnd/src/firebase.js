import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  
    
        apiKey: "AIzaSyB-rODTpbdk9wcLGyiED8e81FArq6vi91E",
        authDomain: "mern-instagram-aoa.firebaseapp.com",
        projectId: "mern-instagram-aoa",
        storageBucket: "mern-instagram-aoa.appspot.com",
        messagingSenderId: "216098650740",
        appId: "1:216098650740:web:2b56a822637c808201af21"
      
  
});
const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
 