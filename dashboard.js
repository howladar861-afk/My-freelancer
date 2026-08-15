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


// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
  authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
  projectId: "rakib-freelancer-9c66b",
  storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
  messagingSenderId: "541209844482",
  appId: "1:541209844482:web:510568d5226c9bf47ac01b"
};


// =====================================
// FIREBASE INIT
// =====================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =====================================
// USER DATA
// =====================================

onAuthStateChanged(auth, async (user) => {

  // -----------------------------------
  // USER NOT LOGIN
  // -----------------------------------

  if (!user) {
    window.location.href = "index.html";
    return;
  }


  try {

    // ---------------------------------
    // USER DOCUMENT
    // ---------------------------------

    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const userDoc = await getDoc(userRef);


    // ---------------------------------
    // USER DOCUMENT NOT FOUND
    // ---------------------------------

    if (!userDoc.exists()) {

      document.getElementById("userEmail").textContent =
        user.email || "";

      document.getElementById("userBalance").textContent =
        "0.00৳";

      document.getElementById("referralCode").textContent =
        "Referral Code: Not Found";

      document.getElementById("referralCount").textContent =
        "Referral Count: 0";

      return;
    }


    // ---------------------------------
    // USER DATA
    // ---------------------------------

    const userData = userDoc.data();


    // =================================
    // EMAIL
    // =================================

    const emailElement =
      document.getElementById("userEmail");

    if (emailElement) {
      emailElement.textContent =
        user.email || "";
    }


    // =================================
    // BALANCE
    // =================================

    const balance =
      Number(userData.balance || 0);

    const balanceElement =
      document.getElementById("userBalance");

    if (balanceElement) {
      balanceElement.textContent =
        balance.toFixed(2) + "৳";
    }


    // =================================
    // REFERRAL CODE
    // =================================

    const referralCodeElement =
      document.getElementById("referralCode");

    if (referralCodeElement) {

      referralCodeElement.textContent =
        "Referral Code: " +
        (userData.referralCode || "Not Found");
    }


    // =================================
    // REFERRAL COUNT
    // =================================

    const referralCount =
      Number(userData.referralCount || 0);

    const referralCountElement =
      document.getElementById("referralCount");

    if (referralCountElement) {

      referralCountElement.textContent =
        "Referral Count: " +
        referralCount;
    }


    // =================================
    // DEBUG
    // =================================

    console.log("User UID:", user.uid);

    console.log("User Data:", userData);

    console.log("Balance:", balance);

    console.log("Referral Count:", referralCount);


  } catch (error) {

    console.error(
      "Dashboard Error:",
      error
    );

  }

});


// =====================================
// LOGOUT
// =====================================

const logoutBtn =
  document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.onclick = async () => {

    try {

      await signOut(auth);

      window.location.href =
        "index.html";

    } catch (error) {

      console.error(
        "Logout Error:",
        error
      );

    }

  };

}


// =====================================
// BALANCE DATE / TIME
// =====================================

const balanceDate =
  document.getElementById("balanceDate");


function updateBalanceDate() {

  if (!balanceDate) {
    return;
  }

  const now = new Date();

  balanceDate.textContent =
    now.toLocaleString("en-GB", {

      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",

      second: "2-digit",

      hour12: true

    });

}


updateBalanceDate();

setInterval(
  updateBalanceDate,
  1000
);


// =====================================
// 3-DOT MENU
// =====================================

window.toggleMenu = function () {

  const menu =
    document.getElementById(
      "threeDotMenu"
    );

  if (!menu) {
    return;
  }

  menu.style.display =
    menu.style.display === "block"
      ? "none"
      : "block";

};


// =====================================
// WITHDRAW
// =====================================

window.openWithdraw = function () {

  window.location.href =
    "withdraw.html";

};


// =====================================
// DEPOSIT
// =====================================

window.openDeposit = function () {

  alert("Deposit অপশন");

};


// =====================================
// ACCOUNT VERIFICATION
// =====================================

window.openVerification = function () {

  window.location.href =
    "verification.html";

};
// =====================================
// CLOUDINARY IMAGE UPLOAD
// =====================================

const CLOUD_NAME = "kjkqazv1";
const UPLOAD_PRESET = "screenshot_upload";

window.uploadToCloudinary = async function (file) {

  if (!file) {
    throw new Error("কোনো ফাইল নির্বাচন করা হয়নি");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary Error:", data);
    throw new Error(
      data.error?.message || "Cloudinary upload failed"
    );
  }

  console.log("Cloudinary Upload Success:", data);

  return data.secure_url;
};
