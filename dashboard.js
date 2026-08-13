import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
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

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  const userDoc =
    await getDoc(userRef);

  if (userDoc.exists()) {

    const userData =
      userDoc.data();

    // =========================
    // EMAIL
    // =========================

    document.getElementById("userEmail").textContent =
      user.email || "";


    // =========================
    // BALANCE
    // =========================

    const balance =
      Number(userData.balance || 0);

    document.getElementById("userBalance").textContent =
      balance.toFixed(2) + "৳";


    // =========================
    // REFERRAL CODE
    // =========================

    document.getElementById("referralCode").textContent =
      "Referral Code: " +
      (userData.referralCode || "Not Found");


    // =========================
    // REFERRAL COUNT
    // =========================

    const referralCount =
      Number(userData.referralCount || 0);

    document.getElementById("referralCount").textContent =
      "Referral Count: " +
      referralCount;


    console.log("User Data:", userData);
    console.log("Balance:", balance);
    console.log("Referral Count:", referralCount);

  } else {

    document.getElementById("userEmail").textContent =
      user.email || "";

    document.getElementById("userBalance").textContent =
      "0.00৳";

    document.getElementById("referralCode").textContent =
      "Referral Code: Not Found";

    document.getElementById("referralCount").textContent =
      "Referral Count: 0";
  }

  }
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
  window.location.href = "withdraw.html";
};

// Deposit
window.openDeposit = function () {
  alert("Deposit অপশন");
};

// Account Verification
window.openVerification = function () {
  window.location.href = "verification.html";
};
