import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  processReferralCommission
} from "./referralCommission.js";

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
// ADMIN UID
// =====================================

const ADMIN_UID = "MwiyoLqCJeYERHAwUKAa17sLwop1";


// =====================================
// FIREBASE START
// =====================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =====================================
// HTML ELEMENTS
// =====================================

const requestList = document.getElementById("requests");

const logoutBtn = document.getElementById("logoutBtn");


// =====================================
// ESCAPE HTML
// =====================================

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return "";
  }

  function escapeHtml(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
  }
}


// =====================================
// ADMIN LOGIN CHECK
// =====================================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;
  }


  // শুধু নির্দিষ্ট Admin UID প্রবেশ করতে পারবে

  if (user.uid !== ADMIN_UID) {

    alert("❌ আপনি Admin নন!");

    window.location.href = "dashboard.html";

    return;
  }


  // Admin হলে Pending request load
  loadVerificationRequests();
loadCompanyWallet();
});


// =====================================
// LOAD PENDING VERIFICATION
// =====================================

function loadVerificationRequests() {

  const requestsRef = collection(
    db,
    "verificationRequests"
  );

  const q = requestsRef;

  onSnapshot(

    q,

    (snapshot) => {

      requestList.innerHTML = "";


      // কোনো pending request নেই

      if (snapshot.empty) {

        requestList.innerHTML = `
          <div class="message">
            ✅ কোনো Pending Verification নেই।
          </div>
        `;

        return;
      }


      // প্রতিটি request দেখানো

      snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        const id = docSnap.id;


        const request = document.createElement("div");

        request.className = "request-card";


        request.innerHTML = `

          <h3>
            👤 ${escapeHtml(data.name || "নাম নেই")}
          </h3>

          <div class="info">
            📧 Email:
            ${escapeHtml(data.email || "নেই")}
          </div>

          <div class="info">
            📞 Payment Number:
            ${escapeHtml(
              data.verificationPaymentNumber || "নেই"
            )}
          </div>

          <div class="info">
            🧾 Transaction ID:
            ${escapeHtml(
              data.verificationTransactionId || "নেই"
            )}
          </div>

          <div class="info">
            🆔 User ID:
            ${escapeHtml(data.userId || "নেই")}
          </div>

          <div class="status">
            ${escapeHtml(
              data.verificationStatus || "pending"
            )}
          </div>

          <div class="buttons">

            <button
              class="approve"
              data-id="${escapeHtml(id)}">
              ✅ Approve
            </button>

            <button
              class="reject"
              data-id="${escapeHtml(id)}">
              ❌ Reject
            </button>

          </div>

          <button
            class="delete-btn"
            data-id="${escapeHtml(id)}"
            style="
              width:100%;
              margin-top:10px;
              padding:10px;
              border:0;
              border-radius:8px;
              background:#64748b;
              color:#fff;
              font-weight:bold;
              cursor:pointer;
            ">
            🗑️ Delete
          </button>

        `;


        requestList.appendChild(request);

      });


      // =================================
      // APPROVE BUTTON
      // =================================

      document
        .querySelectorAll(".approve")
        .forEach((button) => {

          button.onclick = () => {

            approveRequest(
              button.dataset.id
            );

          };

        });


      // =================================
      // REJECT BUTTON
      // =================================

      document
        .querySelectorAll(".reject")
        .forEach((button) => {

          button.onclick = () => {

            rejectRequest(
              button.dataset.id
            );

          };

        });


      // =================================
      // DELETE BUTTON
      // =================================

      document
        .querySelectorAll(".delete-btn")
        .forEach((button) => {

          button.onclick = () => {

            deleteRequest(
              button.dataset.id
            );

          };

        });

    },

    (error) => {

      console.error(
        "Verification Load Error:",
        error
      );


      requestList.innerHTML = `
        <div class="message">
          ❌ Request Load করা যায়নি।<br><br>
          ${escapeHtml(error.message)}
        </div>
      `;

    }

  );

}
// ========================================
// LOAD COMPANY WALLET
// ========================================

async function loadCompanyWallet() {

  const walletElement =
    document.getElementById("companyWallet");

  walletElement.textContent = "Loading...";

  try {

    const walletRef = doc(
      db,
      "company",
      "wallet"
    );

    const walletSnap =
      await getDoc(walletRef);
console.log("Wallet exists:", walletSnap.exists());
console.log("Wallet data:", walletSnap.data());
    if (!walletSnap.exists()) {

      walletElement.textContent = "৳ 0";

      console.log(
        "Company wallet পাওয়া যায়নি"
      );

      return;
    }

    const walletData =
      walletSnap.data();

    const balance =
      walletData.balance || 0;

    walletElement.textContent =
      "৳ " +
      Number(balance).toLocaleString("en-BD");

  } catch (error) {

    console.error(
      "Company Wallet Load Error:",
      error
    );

    walletElement.textContent =
      "❌ Wallet Error";
  }
}

// ========================================
// APPROVE REQUEST
// ========================================

// =====================================
// APPROVE REQUEST + REFERRAL COMMISSION
// =====================================

async function approveRequest(id) {

  if (!confirm("এই Verification Approve করবেন?")) {
    return;
  }

  try {

    const requestRef = doc(
      db,
      "verificationRequests",
      id
    );

    const walletRef = doc(
      db,
      "company",
      "wallet"
    );

    // ---------------------------------
    // প্রথমে Request থেকে User ID নেওয়া
    // ---------------------------------

    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Verification request পাওয়া যায়নি");
    }

    const requestData = requestSnap.data();

    const userId = requestData.userId;

    if (!userId) {
      throw new Error("এই request-এর User ID নেই");
    }

    const userRef = doc(
      db,
      "users",
      userId
    );

    // =================================
    // FIRESTORE TRANSACTION
    // =================================

    await runTransaction(db, async (transaction) => {

      // ---------------------------------
      // ALL READS FIRST
      // ---------------------------------

      const latestRequestSnap =
        await transaction.get(requestRef);

      const userSnap =
        await transaction.get(userRef);

      const walletSnap =
        await transaction.get(walletRef);

      if (!latestRequestSnap.exists()) {
        throw new Error(
          "Verification request পাওয়া যায়নি"
        );
      }

      if (!userSnap.exists()) {
        throw new Error(
          "User account পাওয়া যায়নি"
        );
      }

      if (!walletSnap.exists()) {
        throw new Error(
          "Company Wallet document পাওয়া যায়নি"
        );
      }

      const latestRequest =
        latestRequestSnap.data();

      const userData =
        userSnap.data();

      const walletData =
        walletSnap.data();

      // =================================
      // VERIFY USER
      // =================================

      transaction.set(
        userRef,
        {
          verified: true,
          verificationStatus: "approved",
          verifiedAt: serverTimestamp()
        },
        {
          merge: true
        }
      );

      // =================================
      // UPDATE REQUEST
      // =================================

      transaction.update(
        requestRef,
        {
          verificationStatus: "approved",
          verified: true,

        }
      );

    });

    // =================================
    // WALLET UI REFRESH
    // =================================

    await processReferralCommission(db, id);
await loadCompanyWallet();


  } catch (error) {

    console.error(
      "Approve Error:",
      error
    );

    alert(
      "❌ Approve করা যায়নি:\n\n" +
      error.message
    );

  }

}
// =====================================
// REJECT REQUEST
// =====================================

async function rejectRequest(id) {

  if (
    !confirm(
      "এই Verification Reject করবেন?"
    )
  ) {

    return;
  }


  try {

    const requestRef = doc(
      db,
      "verificationRequests",
      id
    );


    await updateDoc(
      requestRef,
      {

        verificationStatus:
          "rejected",

        verified: false,

        rejectedAt:
          serverTimestamp()

      }
    );


    alert(
      "❌ Verification Rejected!"
    );

  }

  catch (error) {

    console.error(
      "Reject Error:",
      error
    );


    alert(
      "❌ Reject করা যায়নি:\n\n" +
      error.message
    );

  }

}


// =====================================
// DELETE REQUEST
// =====================================

async function deleteRequest(id) {

  if (
    !confirm(
      "এই Request Delete করবেন?"
    )
  ) {

    return;
  }


  try {

    const requestRef = doc(
      db,
      "verificationRequests",
      id
    );


    await deleteDoc(
      requestRef
    );


    alert(
      "🗑️ Request Deleted!"
    );

  }

  catch (error) {

    console.error(
      "Delete Error:",
      error
    );


    alert(
      "❌ Delete করা যায়নি:\n\n" +
      error.message
    );

  }

}


// =====================================
// LOGOUT
// =====================================

logoutBtn.onclick = async () => {

  try {

    await signOut(auth);

    window.location.href =
      "index.html";

  }

  catch (error) {

    console.error(
      "Logout Error:",
      error
    );

    alert(
      "❌ Logout করা যায়নি।"
    );

  }

};
