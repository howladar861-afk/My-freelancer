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
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
  authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
  projectId: "rakib-freelancer-9c66b",
  storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
  messagingSenderId: "541209844482",
  appId: "1:541209844482:web:510568d5226c9bf47ac01b"
};


// ===============================
// ADMIN UID
// ===============================

const ADMIN_UID = "MwiyoLqCJeYERHAwUKAa17sLwop1";


// ===============================
// FIREBASE START
// ===============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ===============================
// HTML ELEMENT
// ===============================

const requestList = document.getElementById("requests");

const logoutBtn = document.getElementById("logoutBtn");


// ===============================
// ADMIN LOGIN CHECK
// ===============================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;
  }


  // Admin UID check

  if (user.uid !== ADMIN_UID) {

    alert("❌ আপনি Admin নন!");

    window.location.href = "dashboard.html";

    return;
  }


  // Admin হলে request load

  loadVerificationRequests();

});


// ===============================
// LOAD PENDING REQUESTS
// ===============================

function loadVerificationRequests() {

  const requestsRef = collection(db, "verificationRequests");

  const q = query(
    requestsRef,
    where("verificationStatus", "==", "pending")
  );


  onSnapshot(q, (snapshot) => {

    requestList.innerHTML = "";


    if (snapshot.empty) {

      requestList.innerHTML = `
        <div class="message">
          ✅ কোনো Pending Verification নেই।
        </div>
      `;

      return;
    }


    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const id = docSnap.id;


      const request = document.createElement("div");

      request.className = "request-card";


      request.innerHTML = `

        <h3>👤 ${data.name || "নাম নেই"}</h3>

        <div class="info">
          📞 Payment Number:
          ${data.verificationPaymentNumber || "নেই"}
        </div>

        <div class="info">
          🧾 Transaction ID:
          ${data.verificationTransactionId || "নেই"}
        </div>

        <div class="info">
          🆔 User ID:
          ${data.userId || "নেই"}
        </div>

        <div class="status">
          ${data.verificationStatus || "pending"}
        </div>

        <div class="buttons">

          <button
            class="approve"
            data-id="${id}">
            ✅ Approve
          </button>

          <button
            class="reject"
            data-id="${id}">
            ❌ Reject
          </button>

        </div>

        <button
          class="delete-btn"
          data-id="${id}"
          style="
            width:100%;
            margin-top:10px;
            padding:10px;
            border:0;
            border-radius:8px;
            background:#64748b;
            color:#fff;
            font-weight:bold;
          ">
          🗑️ Delete
        </button>
      `;


      requestList.appendChild(request);

    });


    // Approve buttons

    document.querySelectorAll(".approve").forEach((button) => {

      button.onclick = () => {

        approveRequest(button.dataset.id);

      };

    });


    // Reject buttons

    document.querySelectorAll(".reject").forEach((button) => {

      button.onclick = () => {

        rejectRequest(button.dataset.id);

      };

    });


    // Delete buttons

    document.querySelectorAll(".delete-btn").forEach((button) => {

      button.onclick = () => {

        deleteRequest(button.dataset.id);

      };

    });

  });

}


// ===============================
// APPROVE
// ===============================

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


    await updateDoc(requestRef, {

      verificationStatus: "approved",

      verified: true,

      verifiedAt: new Date()

    });


    alert("✅ Verification Approved!");

  }

  catch (error) {

    console.error(error);

    alert(
      "❌ Approve করা যায়নি: " +
      error.message
    );

  }

}


// ===============================
// REJECT
// ===============================

async function rejectRequest(id) {

  if (!confirm("এই Verification Reject করবেন?")) {

    return;
  }


  try {

    const requestRef = doc(
      db,
      "verificationRequests",
      id
    );


    await updateDoc(requestRef, {

      verificationStatus: "rejected",

      verified: false,

      rejectedAt: new Date()

    });


    alert("❌ Verification Rejected!");

  }

  catch (error) {

    console.error(error);

    alert(
      "❌ Reject করা যায়নি: " +
      error.message
    );

  }

}


// ===============================
// DELETE
// ===============================

async function deleteRequest(id) {

  if (!confirm("এই Request Delete করবেন?")) {

    return;
  }


  try {

    await deleteDoc(
      doc(
        db,
        "verificationRequests",
        id
      )
    );


    alert("🗑️ Request Deleted!");

  }

  catch (error) {

    console.error(error);

    alert(
      "❌ Delete করা যায়নি: " +
      error.message
    );

  }

}


// ===============================
// LOGOUT
// ===============================

logoutBtn.onclick = async () => {

  await signOut(auth);

  window.location.href = "index.html";

};
