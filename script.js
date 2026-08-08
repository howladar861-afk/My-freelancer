import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// আপনার Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
  authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
  projectId: "rakib-freelancer-9c66b",
  storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
  messagingSenderId: "541209844482",
  appId: "1:541209844482:web:510568d5226c9bf47ac01b",
  measurementId: "G-F6QNE0QN5K"
};

// Firebase চালু
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
// Register
document.getElementById("registerBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const referral = document.getElementById("referral").value.trim();

  if (referral === "") {
    alert("Referral Code is required!");
    return;
  }

  const q = query(
  collection(db, "users"),
  where("referralCode", "==", referral)
);

const querySnapshot = await getDocs(q);

alert("Query Success");

if (querySnapshot.empty) {
  alert("Invalid Referral Code!");
  return;
}

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {

      const myReferral = Math.random().toString(36).substring(2, 8).toUpperCase();

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        referralCode: myReferral,
        referredBy: referral
      });

      alert("Registration Successful!\nYour Referral Code: " + myReferral);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

// Login
document.getElementById("loginBtn").onclick = async () => {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {

    await setPersistence(auth, browserLocalPersistence);

    await signInWithEmailAndPassword(auth, email, password);

    alert("Login Successful!");

    window.location.href = "dashboard.html";

  } catch (error) {

    alert(error.message);

  }

};
