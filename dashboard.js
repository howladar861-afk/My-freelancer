import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs
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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("userEmail").textContent = user.email;
    const userDoc = await getDoc(doc(db, "users", user.uid));
if (userDoc.exists()) {
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("referralCode").textContent =
    "Referral Code: " + userDoc.data().referralCode;
  const q = query(
  collection(db, "users"),
  where("referredBy", "==", userDoc.data().referralCode)
);

const querySnapshot = await getDocs(q);

document.getElementById("referralCount").textContent =
  "Referral Count: " + querySnapshot.size;
} else {
  
  document.getElementById("referralCode").textContent =
    "Referral Code: Not Found";
}
  } else {
    window.location.href = "index.html";
  }
});

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
const balanceDate = document.getElementById("balanceDate");

function updateBalanceDate() {
  if (balanceDate) {
    const now = new Date();

    balanceDate.textContent = now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }
}

updateBalanceDate();
setInterval(updateBalanceDate, 1000);
// 3-dot menu
window.toggleMenu = function () {
  const menu = document.getElementById("threeDotMenu");

  if (menu) {
    menu.style.display =
      menu.style.display === "block" ? "none" : "block";
  }
};

// Withdraw
window.openWithdraw = function () {
  alert("Withdraw অপশন");
};

// Deposit
window.openDeposit = function () {
  alert("Deposit অপশন");
};

// Account Verification
window.openVerification = function () {
  alert("Account Verification — ৳60");
};
