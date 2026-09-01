import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail
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
// =====================================
// REGISTER + 2 LEVEL REFERRAL COMMISSION
// =====================================

document.getElementById("registerBtn").onclick = async () => {

  const email =
    document.getElementById("email").value.trim();

  const name =
  document.getElementById("name").value.trim();
  const password =
    document.getElementById("password").value;

  const referral =
    document.getElementById("referral").value.trim();


  // Referral Code বাধ্যতামূলক
  if (referral === "") {

    showCustomPopup("Referral Code is required!");

    return;
  }


  try {

    // =================================
// FIND DIRECT REFERRER FROM referralCodes
// =================================

const referralRef =
  doc(
    db,
    "referralCodes",
    referral
  );

const referralSnap =
  await getDoc(referralRef);

if (!referralSnap.exists()) {

  showCustomPopup(
    "Invalid Referral Code!"
  );

  return;
}

const referralData =
  referralSnap.data();

const directReferrerUid =
  referralData.uid;

if (!directReferrerUid) {

  showCustomPopup(
    "Referral Code-এর UID পাওয়া যায়নি!"
  );

  return;
}



    // =================================
    // CREATE NEW USER
    // =================================

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const newUserRef =
      doc(
        db,
        "users",
        userCredential.user.uid
      );


    const myReferral =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();


    // =================================
    // FIRESTORE BATCH
    // =================================

    const batch =
      writeBatch(db);


    // নতুন ইউজার
    batch.set(
  newUserRef,
  {
    uid: userCredential.user.uid,
    email: email,
    name: name,
    referralCode: myReferral,
    referredBy: referral,
    verified: false,
    createdAt: serverTimestamp(),
    balance: 0,
    referralCount: 0,
    verificationStatus: "Pending",
    isBanned: false
  }
);
// =================================
// SAVE MY REFERRAL CODE
// =================================

const myReferralCodeRef =
  doc(
    db,
    "referralCodes",
    myReferral
  );

batch.set(
  myReferralCodeRef,
  {
    uid:
      userCredential.user.uid,

    referredBy:
      referral
  }
);

    
    // সব একসাথে Save
    await batch.commit();
// =====================================
// DAILY REFERRAL COUNT
// =====================================

try {

  const { addDailyReferral } =
  await import("./dailyReferral.js");

await addDailyReferral(
  db,
  directReferrerUid
);

} catch (dailyReferralError) {

  console.error(
    "Daily Referral Count Error:",
    dailyReferralError
  );

}

    // =================================
    // SUCCESS
    // =================================

    showCustomPopup(
      "Registration Successful!\n\n" +
      "আপনার Referral Code: " +
      myReferral
    );


    window.location.href =
      "dashboard.html";

  }

  catch (error) {

    console.error(
      "Registration Error:",
      error
    );


    showCustomPopup(
      error.message
    );

  }

};

// Login
document.getElementById("loginBtn").onclick = async () => {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {

    await setPersistence(auth, browserLocalPersistence);

    await signInWithEmailAndPassword(auth, email, password);
const userDoc = await getDoc(
  doc(db, "users", auth.currentUser.uid)
);

if (userDoc.exists()) {

  const data = userDoc.data();

  if (data.isBanned === true) {

    await auth.signOut();

    showCustomPopup(
      "আপনার একাউন্ট ব্যান করা হয়েছে!"
    );

    return;
  }
}
    showCustomPopup("Login Successful!");

    window.location.href = "dashboard.html";

  } catch (error) {

    showCustomPopup(error.message);

  }

};
function showCustomPopup(message) {
  const popup = document.getElementById("customPopup");
  const popupMessage = document.getElementById("popupMessage");

  if (popup && popupMessage) {
    popupMessage.textContent = message;
    popup.style.display = "flex";
  }
}
// Forgot Password
async function sendResetCode() {

  const email = document.getElementById("resetEmail").value.trim();

  if (email === "") {
    showCustomPopup("Gmail Address দিন!");
    return;
  }

  try {

    await sendPasswordResetEmail(auth, email);

    showCustomPopup(
      "Password reset link আপনার Gmail-এ পাঠানো হয়েছে!"
    );

    closeForgotPopup();

  } catch (error) {

    console.error("Password Reset Error:", error);

    showCustomPopup(error.message);

  }
}
