import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
  authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
  projectId: "rakib-freelancer-9c66b",
  storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
  messagingSenderId: "541209844482",
  appId: "1:541209844482:web:510568d5226c9bf47ac01b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userEmail").textContent = user.email;
    const userDoc = await getDoc(doc(db, "users", user.uid));

if (userDoc.exists()) {
  
    document.getElementById("referralCode").textContent =
        "Referral Code: " + userDoc.data().referralCode;
}
  } else {
    window.location.href = "index.html";
  }
});

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
